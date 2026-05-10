import { NextRequest, NextResponse } from 'next/server';
import { Client, type CreatePageParameters, type BlockObjectRequest } from '@notionhq/client';
import { z } from 'zod';
import {
  buildMeetingNoteProperties,
  buildAIDebriefText,
  buildAgentAnalysisProperties,
  extractAgentAnalysisSummaries,
} from '@/lib/projects/notion-meeting-intelligence/fieldMapping';

const RequestSchema = z.object({
  notion_token: z.string().min(10),
  meeting_notes_db_id: z.string().min(10),
  agent_analyses_db_id: z.string().min(10),
  agent_library_db_id: z.string().min(10).optional(),
  recording_link: z.string().url().optional(),
  results: z.object({
    sales: z.record(z.unknown()),
    commercial: z.record(z.unknown()),
    delivery: z.record(z.unknown()),
    product: z.record(z.unknown()),
    icp: z.record(z.unknown()),
    summary: z.record(z.unknown()),
  }),
  metadata: z.object({
    meeting_title: z.string(),
    meeting_date: z.string(),
    company_name: z.string(),
    meeting_type: z.string(),
    engagement_score: z.number(),
    sentiment: z.string(),
    stage_after_meeting: z.string(),
    key_signals: z.array(z.string()),
    action_items: z.array(z.string()),
    general_summary: z.string(),
    opportunities: z.string(),
    buyer_roles_present: z.array(z.string()),
    recording_link: z.string().optional(),
  }),
});

type AnyBlock = {
  object: 'block';
  type: string;
  [key: string]: unknown;
};

function para(content: string): AnyBlock {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: content.slice(0, 2000) } }],
    },
  };
}

function heading2(content: string): AnyBlock {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content } }],
    },
  };
}

function heading3(content: string): AnyBlock {
  return {
    object: 'block',
    type: 'heading_3',
    heading_3: {
      rich_text: [{ type: 'text', text: { content } }],
    },
  };
}

function divider(): AnyBlock {
  return { object: 'block', type: 'divider', divider: {} };
}

function notionUrl(id: string): string {
  return `https://notion.so/${id.replace(/-/g, '')}`;
}

function bullet(content: string): AnyBlock {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content: content.slice(0, 2000) } }],
    },
  };
}

/** Builds structured Notion page blocks for each agent's analysis result */
function buildAgentAnalysisBlocks(slug: string, results: Parameters<typeof buildAIDebriefText>[0]): AnyBlock[] {
  const { sales, commercial, delivery, product, icp, summary } = results;
  const blocks: AnyBlock[] = [];

  if (slug === 'summary') {
    blocks.push(heading2('Executive Summary'));
    blocks.push(para(`Deal Verdict: ${summary.deal_verdict}`));
    blocks.push(para(summary.executive_summary));
    blocks.push(heading3('Top Signals'));
    summary.top_signals.forEach((s) => blocks.push(bullet(s)));
    blocks.push(heading3('Recommended Next Action'));
    blocks.push(para(summary.recommended_next_action));
    blocks.push(heading3('Agent Relevance Scores'));
    summary.agent_relevance.forEach((r) =>
      blocks.push(bullet(`${r.agent}: ${r.relevance_score}/10 — ${r.reason}`))
    );
    if (summary.buyer_roles_present.length > 0) {
      blocks.push(heading3('Buyer Roles Present'));
      summary.buyer_roles_present.forEach((r) => blocks.push(bullet(r)));
    }
  } else if (slug === 'sales') {
    blocks.push(heading2('Sales Coaching Analysis'));
    blocks.push(para(`Overall Score: ${sales.overall_score}/10`));
    blocks.push(para(`Talk Time Balance: ${sales.talk_time_balance}`));
    blocks.push(para(`Objection Handling: ${sales.objection_handling}`));
    blocks.push(heading3('Strengths'));
    sales.strengths.forEach((s) => blocks.push(bullet(s)));
    blocks.push(heading3('Improvement Areas'));
    sales.improvement_areas.forEach((s) => blocks.push(bullet(s)));
    blocks.push(heading3('Best Moment'));
    blocks.push(para(sales.best_moment));
    blocks.push(heading3('Coaching Tip'));
    blocks.push(para(sales.coaching_tip));
  } else if (slug === 'commercial') {
    blocks.push(heading2('Commercial Pricing Analysis'));
    blocks.push(para(`Deal Tier: ${commercial.deal_tier}`));
    blocks.push(para(`Estimated ACV: ${commercial.estimated_acv_range}`));
    blocks.push(para(`Price Sensitivity: ${commercial.price_sensitivity}`));
    blocks.push(para(`Contract Complexity: ${commercial.contract_complexity}`));
    blocks.push(heading3('Budget Signals'));
    commercial.budget_signals.forEach((s) => blocks.push(bullet(s)));
    blocks.push(heading3('Pricing Risk'));
    blocks.push(para(commercial.pricing_risk));
    blocks.push(heading3('Recommended Approach'));
    blocks.push(para(commercial.recommended_approach));
  } else if (slug === 'delivery') {
    blocks.push(heading2('Delivery & Solutioning Analysis'));
    blocks.push(para(`Complexity Score: ${delivery.complexity_score}/10`));
    blocks.push(para(`Deployment Model: ${delivery.deployment_model}`));
    blocks.push(para(`Delivery Risk: ${delivery.delivery_risk}`));
    blocks.push(heading3('Technical Requirements'));
    delivery.technical_requirements.forEach((r) => blocks.push(bullet(r)));
    if (delivery.integration_needs.length > 0) {
      blocks.push(heading3('Integration Needs'));
      delivery.integration_needs.forEach((i) => blocks.push(bullet(i)));
    }
    if (delivery.custom_requirements.length > 0) {
      blocks.push(heading3('Custom Requirements'));
      delivery.custom_requirements.forEach((r) => blocks.push(bullet(r)));
    }
    blocks.push(heading3('SE Recommendation'));
    blocks.push(para(delivery.se_recommendation));
  } else if (slug === 'product') {
    blocks.push(heading2('Product Feedback Analysis'));
    blocks.push(para(`Feedback Priority: ${product.feedback_priority}`));
    blocks.push(heading3('Features That Resonated'));
    product.resonated_features.forEach((f) => blocks.push(bullet(f)));
    if (product.weak_features.length > 0) {
      blocks.push(heading3('Weak or Unclear Features'));
      product.weak_features.forEach((f) => blocks.push(bullet(f)));
    }
    if (product.competitive_gaps.length > 0) {
      blocks.push(heading3('Competitive Gaps'));
      product.competitive_gaps.forEach((g) => blocks.push(bullet(g)));
    }
    if (product.notable_quotes.length > 0) {
      blocks.push(heading3('Notable Quotes'));
      product.notable_quotes.forEach((q) => blocks.push(bullet(`"${q}"`)));
    }
    blocks.push(heading3('Product Team Insight'));
    blocks.push(para(product.product_team_insight));
  } else if (slug === 'icp') {
    blocks.push(heading2('ICP Fit Analysis'));
    blocks.push(para(`Overall ICP Score: ${icp.overall_icp_score.toFixed(1)}/5.0`));
    blocks.push(para(`ICP Tier: ${icp.icp_tier}`));
    blocks.push(para(`Recommendation: ${icp.recommendation}`));
    blocks.push(heading3('Dimension Scores'));
    icp.dimension_scores.forEach((d) =>
      blocks.push(bullet(`${d.dimension} (×${Math.round(d.weight * 100)}%): ${d.score}/5 — ${d.evidence}`))
    );
    if (icp.disqualifying_flags.length > 0) {
      blocks.push(heading3('Disqualifying Flags'));
      icp.disqualifying_flags.forEach((f) => blocks.push(bullet(`⚠️ ${f}`)));
    }
    blocks.push(heading3('Fit Summary'));
    blocks.push(para(icp.fit_summary));
  }

  return blocks;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', detail: parsed.error.message },
      { status: 400 },
    );
  }

  const { notion_token, meeting_notes_db_id, agent_analyses_db_id, agent_library_db_id, results, metadata } =
    parsed.data;

  const notion = new Client({ auth: notion_token });

  // Step 1: Create Meeting Note page
  let meetingPageId: string;
  let meetingPageUrl: string;
  try {
    const debriefText = buildAIDebriefText(
      results as Parameters<typeof buildAIDebriefText>[0],
      metadata as Parameters<typeof buildAIDebriefText>[1],
    );

    const props = buildMeetingNoteProperties(
      metadata as Parameters<typeof buildMeetingNoteProperties>[0],
      debriefText,
    );

    // Build page content blocks (AI Debrief as body for full readable content)
    const blocks: AnyBlock[] = [
      heading2('AI Debrief'),
      ...debriefText
        .split('\n\n---\n\n')
        .map((section) => [
          heading3(section.split('\n')[0]),
          ...section.split('\n').slice(1).filter(Boolean).map(para),
          divider(),
        ])
        .flat(),
    ];

    const page = await notion.pages.create({
      parent: { database_id: meeting_notes_db_id },
      properties: props as CreatePageParameters['properties'],
      children: blocks.slice(0, 100) as BlockObjectRequest[],
    });

    meetingPageId = page.id;
    meetingPageUrl = notionUrl(page.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create Meeting Note page', detail: message },
      { status: 500 },
    );
  }

  // Step 2: Create 6 Agent Analyses rows in parallel (summary + 5 specialist agents)
  const analysisSummaries = extractAgentAnalysisSummaries(
    results as Parameters<typeof extractAgentAnalysisSummaries>[0],
    metadata.company_name,
    metadata.meeting_date,
  );

  let agentAnalysisUrls: string[] = [];
  try {
    const pages = await Promise.all(
      analysisSummaries.map((agentSummary) => {
        const props = buildAgentAnalysisProperties({
          analysisTitle: agentSummary.analysisTitle,
          agentType: agentSummary.agentType,
          meetingPageId,
          meetingDate: agentSummary.meetingDate,
          score: agentSummary.score,
          tier: agentSummary.tier,
          keyFindings: agentSummary.keyFindings,
          recommendedAction: agentSummary.recommendedAction,
        });

        // Build structured page body blocks per agent using the full results
        const analysisBlocks = buildAgentAnalysisBlocks(
          agentSummary.slug,
          results as Parameters<typeof buildAIDebriefText>[0],
        );

        return notion.pages.create({
          parent: { database_id: agent_analyses_db_id },
          properties: props as CreatePageParameters['properties'],
          children: analysisBlocks.slice(0, 100) as BlockObjectRequest[],
        });
      }),
    );
    agentAnalysisUrls = pages.map((p) => notionUrl(p.id));
  } catch (err) {
    // Non-fatal: meeting note was created, agent analyses failed
    console.error('Agent analyses creation failed (non-fatal):', err);
  }

  // Step 3: Update Agent Library rows with Last Run + Manual Hours Saved increment (non-fatal)
  if (agent_library_db_id) {
    try {
      // Query all agents in the library that are triggered by Meeting Analysis
      const libraryResponse = await notion.databases.query({
        database_id: agent_library_db_id,
        filter: {
          property: 'Trigger',
          select: { equals: 'Meeting Analysis' },
        },
        page_size: 20,
      });

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      await Promise.all(
        libraryResponse.results.map(async (page) => {
          if (page.object !== 'page') return;

          // Read the Agent Slug property to know which result key this agent maps to
          const slugProp = (page as { properties: Record<string, unknown> }).properties['Agent Slug'];
          const slug =
            slugProp &&
            typeof slugProp === 'object' &&
            (slugProp as { type: string }).type === 'rich_text'
              ? ((slugProp as { rich_text: { plain_text: string }[] }).rich_text[0]?.plain_text ?? '')
              : '';

          // Only update agents we have results for
          const knownSlugs = ['sales', 'commercial', 'delivery', 'product', 'icp', 'summary'];
          if (!knownSlugs.includes(slug)) return;

          // Read current Manual Hours Saved value
          const hoursProp = (page as { properties: Record<string, unknown> }).properties['Manual Hours Saved'];
          const currentMinutes =
            hoursProp &&
            typeof hoursProp === 'object' &&
            (hoursProp as { type: string }).type === 'number'
              ? ((hoursProp as { number: number | null }).number ?? 0)
              : 0;

          // Add a random 10–20 minute increment
          const increment = Math.floor(Math.random() * 11) + 10;

          await notion.pages.update({
            page_id: page.id,
            properties: {
              'Manual Hours Saved': { number: currentMinutes + increment },
              'Last Run': { date: { start: today } },
            },
          });
        }),
      );
    } catch (err) {
      // Non-fatal: analyses were written successfully; library update is best-effort
      console.error('Agent Library update failed (non-fatal):', err);
    }
  }

  return NextResponse.json({ meeting_page_url: meetingPageUrl, agent_analysis_urls: agentAnalysisUrls });
}
