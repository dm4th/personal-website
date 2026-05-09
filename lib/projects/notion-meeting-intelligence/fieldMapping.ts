import type { AgentResults, MeetingMetadata } from './types';

type AnyProps = Record<string, unknown>;

function richText(content: string): AnyProps {
  return {
    rich_text: [{ type: 'text', text: { content: content.slice(0, 2000) } }],
  };
}

// Maps MeetingMetadata → Meeting Notes database property payload
export function buildMeetingNoteProperties(metadata: MeetingMetadata, debriefText: string): AnyProps {
  const sentimentMap: Record<string, string> = {
    '🟢 Positive': '🟢 Positive',
    '🟡 Neutral': '🟡 Neutral',
    '🔴 Negative': '🔴 Negative',
  };

  const stageMap: Record<string, string> = {
    'Move forward': 'Move forward',
    'Hold': 'Hold',
    'De-prioritize': 'De-prioritize',
    'Re-qualify ICP': 'Re-qualify ICP',
  };

  const categoryMap: Record<string, string> = {
    'Discovery': 'Discovery',
    'Executive Briefing': 'Check-In',
    'Technical Deep-Dive': 'Solutioning',
    'QBR': 'Check-In',
    'Demo': 'Demo',
    'Other': 'Other',
  };

  const props: AnyProps = {
    'Meeting Title': { title: [{ text: { content: metadata.meeting_title } }] },
    'Date': { date: { start: metadata.meeting_date } },
    'Category': {
      multi_select: [{ name: categoryMap[metadata.meeting_type] ?? 'Other' }],
    },
    'Engagement Score': { number: metadata.engagement_score },
    'Sentiment': { select: { name: sentimentMap[metadata.sentiment] ?? '🟡 Neutral' } },
    'Stage After Meeting': { select: { name: stageMap[metadata.stage_after_meeting] ?? 'Hold' } },
    'Key Signals': richText(metadata.key_signals.map((s) => `• ${s}`).join('\n')),
    'Action Items': richText(metadata.action_items.map((a) => `☐ ${a}`).join('\n')),
    'General Summary': richText(metadata.general_summary),
    'Opportunities': richText(metadata.opportunities),
    'AI Debrief': richText(debriefText),
    'Buyer Roles Present': richText(
      metadata.buyer_roles_present.length > 0
        ? metadata.buyer_roles_present.join('\n')
        : 'Not specified',
    ),
  };

  if (metadata.recording_link) {
    props['Recording Link'] = { url: metadata.recording_link };
  }

  return props;
}

// Builds the AI Debrief text from all 6 agent results
export function buildAIDebriefText(results: AgentResults, _metadata: MeetingMetadata): string {
  const { sales, commercial, delivery, product, icp, summary } = results;

  const sections = [
    `📋 EXECUTIVE SUMMARY (${summary.deal_verdict})\n${summary.executive_summary}\nNext action: ${summary.recommended_next_action}`,
    `⚡ SALES COACHING (${sales.overall_score * 10}/100)\n${sales.coaching_tip}\nStrengths: ${sales.strengths.join('; ')}\nImprove: ${sales.improvement_areas.join('; ')}`,
    `💰 COMMERCIAL (${commercial.deal_tier} | ${commercial.estimated_acv_range})\n${commercial.recommended_approach}`,
    `🔧 DELIVERY (Complexity ${delivery.complexity_score * 10}/100 | ${delivery.delivery_risk} risk)\n${delivery.se_recommendation}`,
    `🧪 PRODUCT FEEDBACK (Priority: ${product.feedback_priority})\n${product.product_team_insight}`,
    `🎯 ICP FIT (${icp.icp_tier} | Score: ${icp.overall_icp_score.toFixed(1)}/5.0)\n${icp.fit_summary}\nRecommendation: ${icp.recommendation}`,
  ];

  return sections.join('\n\n---\n\n');
}

// Maps a single agent result → Agent Analyses database property payload
export function buildAgentAnalysisProperties(params: {
  analysisTitle: string;
  agentType: string;
  meetingPageId: string;
  meetingDate: string;
  score: number;
  tier: string;
  keyFindings: string;
  recommendedAction: string;
}): AnyProps {
  return {
    'Analysis Title': {
      title: [{ text: { content: params.analysisTitle } }],
    },
    'Meeting': { relation: [{ id: params.meetingPageId }] },
    'Agent Type': { select: { name: params.agentType } },
    'Analysis Date': { date: { start: params.meetingDate } },
    'Score': { number: params.score },
    'Tier / Rating': { select: { name: params.tier } },
    'Key Findings': richText(params.keyFindings),
    'Recommended Action': richText(params.recommendedAction),
  };
}

// Extracts per-agent summary data for Agent Analyses rows
export function extractAgentAnalysisSummaries(
  results: AgentResults,
  companyName: string,
  meetingDate: string,
): {
  slug: string;
  analysisTitle: string;
  agentType: string;
  meetingDate: string;
  score: number;
  tier: string;
  keyFindings: string;
  recommendedAction: string;
}[] {
  const { sales, commercial, delivery, product, icp, summary } = results;

  const rows = [
    {
      slug: 'summary',
      agentType: '📋 Meeting Summary',
      score: summary.deal_verdict === 'Strong Opportunity' ? 90 : summary.deal_verdict === 'Qualified Pipeline' ? 70 : summary.deal_verdict === 'Needs Qualification' ? 40 : 20,
      tier: summary.deal_verdict,
      keyFindings: [
        summary.executive_summary.slice(0, 200),
        `Top signals: ${summary.top_signals.join('; ')}`,
      ].join('\n'),
      recommendedAction: summary.recommended_next_action,
    },
    {
      slug: 'sales',
      agentType: '⚡ Sales Training',
      score: Math.round(sales.overall_score * 10),
      tier: sales.objection_handling,
      keyFindings: [
        `Talk time: ${sales.talk_time_balance}`,
        `Objection handling: ${sales.objection_handling}`,
        `Best moment: ${sales.best_moment.slice(0, 120)}`,
      ].join('\n'),
      recommendedAction: sales.coaching_tip,
    },
    {
      slug: 'commercial',
      agentType: '💰 Commercial Pricing',
      score: commercial.price_sensitivity === 'Low' ? 80 : commercial.price_sensitivity === 'Medium' ? 50 : 30,
      tier: commercial.deal_tier,
      keyFindings: [
        `ACV: ${commercial.estimated_acv_range}`,
        `Price sensitivity: ${commercial.price_sensitivity}`,
        `Contract: ${commercial.contract_complexity}`,
        ...commercial.budget_signals.slice(0, 2),
      ].join('\n'),
      recommendedAction: commercial.recommended_approach,
    },
    {
      slug: 'delivery',
      agentType: '🔧 Delivery',
      score: Math.round((10 - delivery.complexity_score + 1) * 10),
      tier: delivery.delivery_risk,
      keyFindings: [
        `Deployment: ${delivery.deployment_model}`,
        `Complexity: ${delivery.complexity_score}/10`,
        `Risk: ${delivery.delivery_risk}`,
        ...delivery.technical_requirements.slice(0, 2),
      ].join('\n'),
      recommendedAction: delivery.se_recommendation,
    },
    {
      slug: 'product',
      agentType: '🧪 Product Feedback',
      score: product.feedback_priority === 'High' ? 90 : product.feedback_priority === 'Medium' ? 60 : 30,
      tier: product.feedback_priority,
      keyFindings: [
        `Resonated: ${product.resonated_features.slice(0, 2).join(', ')}`,
        `Weak: ${product.weak_features.slice(0, 2).join(', ') || 'None identified'}`,
        ...product.notable_quotes.slice(0, 1).map((q) => `Quote: "${q}"`),
      ].join('\n'),
      recommendedAction: product.product_team_insight,
    },
    {
      slug: 'icp',
      agentType: '🎯 ICP Fit',
      score: Math.round(icp.overall_icp_score * 20),
      tier: icp.icp_tier,
      keyFindings: [
        `Score: ${icp.overall_icp_score.toFixed(1)}/5.0`,
        `Tier: ${icp.icp_tier}`,
        ...icp.disqualifying_flags.slice(0, 1).map((f) => `Flag: ${f}`),
        icp.fit_summary.slice(0, 100),
      ].join('\n'),
      recommendedAction: `${icp.recommendation}: ${icp.fit_summary.slice(0, 150)}`,
    },
  ];

  return rows.map((row) => ({
    ...row,
    meetingDate,
    analysisTitle: `${companyName} - ${row.agentType}`,
  }));
}
