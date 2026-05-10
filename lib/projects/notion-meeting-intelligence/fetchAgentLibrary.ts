/**
 * Fetches meeting-analysis agent definitions from the Notion Agent Library database.
 *
 * This makes the 6-agent pipeline fully data-driven:
 *   - Agent system prompts are stored as rows in the Agent Library database.
 *   - The ICP scoring rubric (weights, per-score descriptions) is stored in the
 *     separate ICP Scoring Rubric database and injected into the ICP agent prompt
 *     at runtime via the {{ICP_RUBRIC}} placeholder.
 *
 * Edit a prompt or rubric score in Notion → the next analyze call picks it up
 * automatically (5-minute in-memory cache, no deploy required).
 *
 * Falls back gracefully: if the Notion fetch fails, analyze/route.ts falls back
 * to the hardcoded prompts in prompts.ts. If only the rubric fetch fails, the
 * ICP agent still runs - it just keeps the {{ICP_RUBRIC}} text as its placeholder,
 * which won't break JSON output.
 *
 * Schema notes (updated):
 *   - "Agent Slug"    rich_text  — matches AgentName keys (sales, commercial, etc.)
 *   - "Trigger"       select     — filter value "Meeting Analysis"
 *   - "System Prompt" rich_text  — agent-specific prompt body (base instruction prepended at runtime)
 *   - Dropped: "Execution Order", "Meeting Analysis" checkbox, "Output Schema Key", "Agent Emoji"
 */

import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client';
import type { AgentName } from './prompts';

export type AgentLibraryEntry = {
  agentName: string;
  /** Maps to AgentName key: 'sales' | 'commercial' | 'delivery' | 'product' | 'icp' | 'summary' */
  outputSchemaKey: AgentName;
  /** Agent-specific prompt body only — base instruction prepended at runtime */
  systemPromptBody: string;
  stakeholder: string;
  jobToBeDone: string;
};

/** Collection (data source) ID of the Agent Library in the GTM Hub workspace */
export const AGENT_LIBRARY_DATA_SOURCE_ID = '5c82e2b2-4545-41de-80b9-2ed966d1f3e1';

/** Collection (data source) ID of the ICP Scoring Rubric database */
const ICP_RUBRIC_DATA_SOURCE_ID = '35afc8f4-554c-800c-9931-000bc3cfea39';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let _cache: { agents: AgentLibraryEntry[]; fetchedAt: number } | null = null;

type NotionPropMap = Record<string, Record<string, unknown>>;

/** Extract plain text from a Notion rich_text or title property. */
function getText(
  prop: { rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }> } | undefined,
): string {
  if (!prop) return '';
  const arr = prop.rich_text ?? prop.title ?? [];
  return arr.map((b) => b.plain_text).join('');
}

/** Fetch the full page body of an agent page and return it as plain text. */
async function getPageBody(notion: Client, pageId: string): Promise<string> {
  try {
    const blocks = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
    const lines: string[] = [];
    for (const block of blocks.results) {
      if (!('type' in block)) continue;
      const b = block as { type: string; [key: string]: unknown };
      // Extract rich_text from paragraph, heading_1/2/3, bulleted/numbered list items, callout, quote
      const richTextTypes = [
        'paragraph', 'heading_1', 'heading_2', 'heading_3',
        'bulleted_list_item', 'numbered_list_item', 'callout', 'quote',
      ];
      if (richTextTypes.includes(b.type)) {
        const inner = b[b.type] as { rich_text?: Array<{ plain_text: string }> } | undefined;
        const text = inner?.rich_text?.map((r) => r.plain_text).join('') ?? '';
        if (text) lines.push(text);
      } else if (b.type === 'code') {
        const inner = b.code as { rich_text?: Array<{ plain_text: string }> } | undefined;
        const text = inner?.rich_text?.map((r) => r.plain_text).join('') ?? '';
        if (text) lines.push(text);
      }
    }
    return lines.join('\n');
  } catch {
    return '';
  }
}

/**
 * Fetches the ICP Scoring Rubric from Notion and formats it as a structured
 * block for injection into the ICP agent's system prompt via {{ICP_RUBRIC}}.
 *
 * Output example:
 *   ICP DIMENSIONS AND WEIGHTS (live from Notion ICP Scoring Rubric):
 *
 *   1. Workspace Fragmentation Pain (25%)
 *      Measurement: How much pain does the prospect feel from sprawl…
 *      Score 1: Custom-built internal tools or strong commitment to incumbent stack.
 *      …
 *      Score 5: Actively running an RFP to consolidate ≥3 productivity tools…
 */
async function buildICPRubricText(notion: Client): Promise<string> {
  const response = await notion.dataSources.query({
    data_source_id: ICP_RUBRIC_DATA_SOURCE_ID,
    sorts: [{ property: 'Order', direction: 'ascending' }],
  });

  const lines: string[] = ['ICP DIMENSIONS AND WEIGHTS (live from Notion ICP Scoring Rubric):'];

  response.results
    .filter((page): page is PageObjectResponse => page.object === 'page')
    .forEach((page, idx) => {
      const props = page.properties as unknown as NotionPropMap;
      const dimension = getText(props['Dimension'] as Parameters<typeof getText>[0]);
      const weight = (props['Weight'] as { number?: number } | undefined)?.number ?? 0;
      const measurement = getText(props['Measurement'] as Parameters<typeof getText>[0]);
      const weightPct = Math.round(weight * 100);

      lines.push('');
      lines.push(`${idx + 1}. ${dimension} (${weightPct}%)`);
      if (measurement) lines.push(`   Measurement: ${measurement}`);
      for (let score = 1; score <= 5; score++) {
        const desc = getText(props[`Description - ${score}`] as Parameters<typeof getText>[0]);
        if (desc) lines.push(`   Score ${score}: ${desc}`);
      }
    });

  return lines.join('\n');
}

/**
 * Returns all Agent Library rows whose Trigger = "Meeting Analysis",
 * with any {{ICP_RUBRIC}} placeholders replaced with the live rubric
 * fetched from the ICP Scoring Rubric database.
 *
 * Results are cached in-process for 5 minutes. Pass `force = true` to
 * bypass the cache (useful in dev or after editing prompts in Notion).
 */
export async function fetchMeetingAgents(force = false): Promise<AgentLibraryEntry[]> {
  if (!force && _cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.agents;
  }

  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  const response = await notion.dataSources.query({
    data_source_id: AGENT_LIBRARY_DATA_SOURCE_ID,
    filter: {
      property: 'Trigger',
      select: { equals: 'Meeting Analysis' },
    },
    // No sort: Execution Order property was dropped; agents are matched by slug, not position
  });

  const pages = response.results.filter((page): page is PageObjectResponse => page.object === 'page');

  // Fetch each agent's page body in parallel — this is the primary source for system prompts.
  // Falls back gracefully per-agent if the body fetch fails (getPageBody catches internally).
  const pageBodies = await Promise.all(pages.map((page) => getPageBody(notion, page.id)));

  const rawAgents = pages
    .map((page, i) => {
      const props = page.properties as unknown as NotionPropMap;
      return {
        agentName: getText(props['Agent Name'] as Parameters<typeof getText>[0]),
        outputSchemaKey: getText(props['Agent Slug'] as Parameters<typeof getText>[0]) as AgentName,
        // Page body is the authoritative prompt source; "System Prompt" property is a fallback
        systemPromptBody: pageBodies[i] || getText(props['System Prompt'] as Parameters<typeof getText>[0]),
        stakeholder: (props['Stakeholder'] as { select?: { name?: string } } | undefined)?.select?.name ?? '',
        jobToBeDone: getText(props['Job to be Done'] as Parameters<typeof getText>[0]),
      };
    })
    .filter((a) => !!a.outputSchemaKey);

  // If any agent has the {{ICP_RUBRIC}} placeholder, fetch the live rubric and inject it.
  // This runs in parallel with nothing else blocking it — Notion is the single round trip.
  const needsRubric = rawAgents.some((a) => a.systemPromptBody.includes('{{ICP_RUBRIC}}'));
  let rubricText: string | null = null;
  if (needsRubric) {
    try {
      rubricText = await buildICPRubricText(notion);
    } catch {
      // Rubric DB not yet shared with the integration, or transient error.
      // The ICP agent will run with the hardcoded fallback dimensions from prompts.ts
      // (analyze/route.ts detects <5 agents and falls back entirely if needed).
    }
  }

  const agents: AgentLibraryEntry[] = rawAgents.map((a) => ({
    ...a,
    systemPromptBody: rubricText
      ? a.systemPromptBody.replace('{{ICP_RUBRIC}}', rubricText)
      : a.systemPromptBody,
  }));

  _cache = { agents, fetchedAt: Date.now() };
  return agents;
}
