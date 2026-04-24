import { Client, isFullPage, isFullBlock } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Data source IDs (collection:// UUIDs from the Notion workspace)
const DS_OPPORTUNITIES = '34bfc8f4-554c-80e5-ab24-000b45a034ef';
const DS_COMPANIES = '34bfc8f4-554c-8059-bd1d-000b1359b9eb';
const DS_ENCOUNTERS = '34bfc8f4-554c-80e8-a66f-000b05b2a117';

type AnyProps = Record<string, any>;

function titleText(props: AnyProps, key: string): string {
  return props[key]?.title?.[0]?.text?.content ?? props[key]?.title?.[0]?.plain_text ?? '';
}

function urlProp(props: AnyProps, key: string): string | null {
  return props[key]?.url ?? null;
}

function statusProp(props: AnyProps, key: string): string {
  return props[key]?.status?.name ?? '';
}

export async function findCompanyByName(name: string): Promise<string | null> {
  const response = await notion.dataSources.query({
    data_source_id: DS_COMPANIES,
    filter: { property: 'Company', title: { equals: name } },
    page_size: 1,
  });
  const first = response.results[0];
  return first ? first.id : null;
}

export async function createCompany(name: string, webPage?: string): Promise<string> {
  const response = await notion.pages.create({
    parent: { data_source_id: DS_COMPANIES, type: 'data_source_id' },
    properties: {
      Company: { title: [{ text: { content: name } }] },
      ...(webPage ? { 'Web Page': { url: webPage } } : {}),
    } as any,
  });
  return response.id;
}

export async function findOrCreateCompany(
  name: string,
  webPage?: string,
): Promise<{ id: string; created: boolean }> {
  const existing = await findCompanyByName(name);
  if (existing) return { id: existing, created: false };
  const id = await createCompany(name, webPage);
  return { id, created: true };
}

export async function createJobOpportunity(params: {
  title: string;
  companyId: string;
  jobPostUrl?: string;
}): Promise<{ id: string; url: string }> {
  const response = await notion.pages.create({
    parent: { data_source_id: DS_OPPORTUNITIES, type: 'data_source_id' },
    properties: {
      Opportunity: { title: [{ text: { content: params.title } }] },
      '🏢 Companies': { relation: [{ id: params.companyId }] },
      'Application Status': { status: { name: 'Not Started' } },
      ...(params.jobPostUrl ? { 'Job Post': { url: params.jobPostUrl } } : {}),
    } as any,
  });
  return { id: response.id, url: `https://notion.so/${response.id.replace(/-/g, '')}` };
}

export async function createJobEncounter(params: {
  title: string;
  jobId: string;
  date: string;
  notes?: string;
}): Promise<string> {
  const response = await notion.pages.create({
    parent: { data_source_id: DS_ENCOUNTERS, type: 'data_source_id' },
    properties: {
      'Encounter Title': { title: [{ text: { content: params.title } }] },
      Job: { relation: [{ id: params.jobId }] },
      Date: { date: { start: params.date } },
    } as any,
    ...(params.notes
      ? {
          children: [
            {
              object: 'block' as const,
              type: 'paragraph' as const,
              paragraph: {
                rich_text: [{ type: 'text' as const, text: { content: params.notes.slice(0, 2000) } }],
              },
            },
          ],
        }
      : {}),
  });
  return response.id;
}

/** Updates the Job Fit Score number and sets status to "Fit Scored". */
export async function updateOpportunityScore(pageId: string, fitScore: number): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      'Job Fit Score': { number: fitScore },
      'Application Status': { status: { name: 'Fit Scored' } },
    } as any,
  });
}

/**
 * Deletes all blocks from the "Application Materials" heading onward,
 * preserving any JD content added before it (e.g. the JD toggle).
 * Returns the number of blocks deleted.
 */
export async function cleanAnalysisBlocks(pageId: string): Promise<number> {
  const response = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  const fullBlocks = (response.results as AnyBlock[]).filter(isFullBlock);

  const analysisIdx = fullBlocks.findIndex(
    (b) => b.type === 'heading_1' && blockText(b).includes('Application Materials'),
  );
  if (analysisIdx === -1) return 0;

  const toDelete = fullBlocks.slice(analysisIdx);
  for (const b of toDelete) {
    await notion.blocks.delete({ block_id: b.id });
  }
  return toDelete.length;
}

/** Returns true only if the page already has an "Application Materials" analysis section. */
export async function hasExistingAnalysis(pageId: string): Promise<boolean> {
  const response = await notion.blocks.children.list({ block_id: pageId, page_size: 50 });
  return response.results.filter(isFullBlock).some((b) => {
    if (b.type !== 'heading_1') return false;
    const text: string = (b as AnyBlock).heading_1?.rich_text?.[0]?.plain_text ?? '';
    return text.includes('Application Materials');
  });
}

/** Extracts plain text from a Notion block's rich_text array. */
function blockText(b: AnyBlock): string {
  const rt: AnyBlock[] = b[b.type]?.rich_text ?? [];
  return rt.map((r: AnyBlock) => r.plain_text ?? r.text?.content ?? '').join('');
}

const TEXT_BLOCK_TYPES = new Set([
  'paragraph', 'bulleted_list_item', 'numbered_list_item',
  'toggle', 'heading_1', 'heading_2', 'heading_3',
  'quote', 'callout',
]);

async function extractTextFromBlocks(blockList: AnyBlock[]): Promise<string[]> {
  const lines: string[] = [];
  for (const b of blockList) {
    if (!TEXT_BLOCK_TYPES.has(b.type)) continue;
    const text = blockText(b).trim();
    if (text) lines.push(text);
    // Recursively fetch children (toggle blocks, etc.)
    if (b.has_children) {
      const children = await notion.blocks.children.list({ block_id: b.id, page_size: 100 });
      const childLines = await extractTextFromBlocks(
        (children.results as AnyBlock[]).filter(isFullBlock),
      );
      lines.push(...childLines);
    }
  }
  return lines;
}

/**
 * Reads JD content from the Notion page body.
 *
 * Handles two layouts:
 *   1. Toggle heading — "Job Description" heading_1 with all content as its children
 *   2. Flat layout — content as sibling blocks after a "Job Description" heading
 *
 * Stops before any "Application Materials" analysis section.
 */
export async function readJdFromNotionPage(pageId: string): Promise<string | null> {
  const response = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  const fullBlocks = (response.results as AnyBlock[]).filter(isFullBlock);

  // Find the JD heading block
  const jdHeadingIdx = fullBlocks.findIndex((b) => {
    if (!TEXT_BLOCK_TYPES.has(b.type)) return false;
    return blockText(b).toLowerCase().includes('job description') ||
           blockText(b).toLowerCase().includes('job posting');
  });

  // Find where analysis starts (stop before this)
  const analysisIdx = fullBlocks.findIndex((b) =>
    b.type === 'heading_1' && blockText(b).includes('Application Materials'),
  );

  const lines: string[] = [];

  if (jdHeadingIdx >= 0) {
    const jdHeading = fullBlocks[jdHeadingIdx];

    // Layout 1: JD content is inside the heading's children (toggle heading)
    if (jdHeading.has_children) {
      const children = await notion.blocks.children.list({ block_id: jdHeading.id, page_size: 100 });
      lines.push(...await extractTextFromBlocks(
        (children.results as AnyBlock[]).filter(isFullBlock),
      ));
    }

    // Layout 2 (or supplement): JD content is in sibling blocks after the heading
    const siblingStart = jdHeadingIdx + 1;
    const siblingEnd = analysisIdx >= 0 ? analysisIdx : fullBlocks.length;
    const siblings = fullBlocks.slice(siblingStart, siblingEnd);
    lines.push(...await extractTextFromBlocks(siblings));
  } else {
    // No JD heading — read all blocks before the analysis section
    const end = analysisIdx >= 0 ? analysisIdx : fullBlocks.length;
    lines.push(...await extractTextFromBlocks(fullBlocks.slice(0, end)));
  }

  const result = lines.join('\n');
  return result.length > 50 ? result : null;
}

export type ApplicationMaterials = {
  fitScore: number;
  roleTitle: string;
  company?: string;
  strengths: Array<{ point: string; evidence: Array<{ file: string; excerpt: string }> }>;
  gaps: Array<{ point: string; mitigation?: string }>;
  suggestedTalkingPoints: string[];
  recommendedRoleFraming: string;
  coverLetter: string;
};

type AnyBlock = any;

function heading(level: 1 | 2, content: string): AnyBlock {
  const key = level === 1 ? 'heading_1' : 'heading_2';
  return {
    object: 'block',
    type: key,
    [key]: { rich_text: [{ type: 'text', text: { content: content.slice(0, 2000) } }] },
  };
}

function para(content: string): AnyBlock {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: content.slice(0, 2000) } }] },
  };
}

function bullet(content: string): AnyBlock {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ type: 'text', text: { content: content.slice(0, 2000) } }] },
  };
}

export async function appendOpportunityMaterials(
  pageId: string,
  materials: ApplicationMaterials,
  jobDescriptionText?: string,
): Promise<void> {
  const blocks: AnyBlock[] = [];

  // Store the raw JD in a collapsed toggle so it's accessible but doesn't clutter the view
  if (jobDescriptionText) {
    const jdChildren: AnyBlock[] = [];
    for (const p of jobDescriptionText.split(/\n\n+/).filter(Boolean)) {
      for (let i = 0; i < p.length; i += 1900) {
        jdChildren.push(para(p.slice(i, i + 1900)));
      }
    }
    blocks.push({
      object: 'block',
      type: 'toggle',
      toggle: {
        rich_text: [{ type: 'text', text: { content: '📄 Job Description (raw)' } }],
        children: jdChildren.slice(0, 90), // Notion caps nested block creation depth
      },
    });
    blocks.push({ object: 'block', type: 'divider', divider: {} });
  }

  blocks.push(
    heading(1, `Application Materials — Fit Score: ${materials.fitScore}/100`),
    heading(2, 'Cover Letter'),
  );

  for (const p of materials.coverLetter.split(/\n\n+/).filter(Boolean)) {
    for (let i = 0; i < p.length; i += 1900) {
      blocks.push(para(p.slice(i, i + 1900)));
    }
  }

  blocks.push(heading(2, 'Strengths'));
  for (const s of materials.strengths) blocks.push(bullet(s.point));

  blocks.push(heading(2, 'Gaps & Mitigations'));
  for (const g of materials.gaps) {
    blocks.push(bullet(`${g.point}${g.mitigation ? ` → ${g.mitigation}` : ''}`));
  }

  blocks.push(heading(2, 'Interview Talking Points'));
  for (const tp of materials.suggestedTalkingPoints) blocks.push(bullet(tp));

  blocks.push(heading(2, 'Recommended Role Framing'));
  blocks.push(para(materials.recommendedRoleFraming));

  // Notion allows max 100 blocks per append call
  for (let i = 0; i < blocks.length; i += 100) {
    await notion.blocks.children.append({ block_id: pageId, children: blocks.slice(i, i + 100) });
  }
}

export async function getOpportunitiesForProcessing(): Promise<
  Array<{ id: string; title: string; jobPostUrl: string | null; notionUrl: string }>
> {
  const response = await notion.dataSources.query({
    data_source_id: DS_OPPORTUNITIES,
    filter: { property: 'Application Status', status: { equals: 'Not Started' } },
  });

  return response.results.filter(isFullPage).map((page) => {
    const props = page.properties as AnyProps;
    return {
      id: page.id,
      title: titleText(props, 'Opportunity'),
      jobPostUrl: urlProp(props, 'Job Post'),
      notionUrl: `https://notion.so/${page.id.replace(/-/g, '')}`,
    };
  });
}
