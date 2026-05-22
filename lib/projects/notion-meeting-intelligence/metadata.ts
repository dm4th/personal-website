import type { AgentResults, MeetingMetadata } from './types';

export function deriveMetadata(
  results: AgentResults,
  transcript: string,
  meetingType: string,
  today: string,
): MeetingMetadata {
  const { sales, commercial, delivery, product, icp, summary } = results;

  const companyMatch = transcript.match(/\b([A-Z][a-zA-Z]+ (?:Health|Tech|Systems|Ventures|Capital|Labs|Studio|Media|Compute|Robotics|Marketplace|Platform|Software|Group|Inc|LLC|Corp)(?:\s+[A-Z][a-zA-Z]+)*)/);
  const companyName = companyMatch?.[1]?.trim() ?? 'Unknown Company';

  let sentiment: MeetingMetadata['sentiment'];
  if (sales.overall_score >= 7) sentiment = '🟢 Positive';
  else if (sales.overall_score >= 4) sentiment = '🟡 Neutral';
  else sentiment = '🔴 Negative';

  let stageAfterMeeting: MeetingMetadata['stage_after_meeting'];
  if (icp.icp_tier === 'Tier 3 🔴' || commercial.deal_tier === 'Unqualified') {
    stageAfterMeeting = 'De-prioritize';
  } else if (sales.overall_score <= 3 || icp.overall_icp_score < 2.5) {
    stageAfterMeeting = 'Re-qualify ICP';
  } else if (icp.icp_tier === 'Tier 1 🟢' && sales.overall_score >= 6) {
    stageAfterMeeting = 'Move forward';
  } else {
    stageAfterMeeting = 'Hold';
  }

  const keySignals: string[] = summary.top_signals.length >= 3
    ? summary.top_signals.slice(0, 3).map((s) => s.slice(0, 80))
    : [
        sales.best_moment.slice(0, 80),
        commercial.budget_signals[0] ?? `${commercial.deal_tier} deal tier`,
        icp.dimension_scores.find((d) => d.score >= 4)?.evidence ?? icp.fit_summary.slice(0, 80),
      ].filter(Boolean).slice(0, 3);

  const actionItems: string[] = [
    delivery.se_recommendation.slice(0, 100),
    commercial.recommended_approach.slice(0, 100),
    product.resonated_features.length > 0
      ? `Follow up on ${product.resonated_features[0]} resonance`
      : undefined,
  ].filter((a): a is string => Boolean(a)).slice(0, 3);

  const meetingTitle = `${companyName} - ${meetingType} - ${today}`;

  const opportunities = [
    `Deal Tier: ${commercial.deal_tier}`,
    `ACV Range: ${commercial.estimated_acv_range}`,
    `Contract: ${commercial.contract_complexity}`,
    `Approach: ${commercial.recommended_approach}`,
    `ICP: ${icp.icp_tier} - score ${icp.overall_icp_score.toFixed(1)}/5.0`,
    `Recommendation: ${icp.recommendation}`,
  ].join('\n');

  return {
    meeting_title: meetingTitle,
    meeting_date: today,
    company_name: companyName,
    meeting_type: meetingType,
    engagement_score: Math.round(sales.overall_score * 10),
    sentiment,
    stage_after_meeting: stageAfterMeeting,
    key_signals: keySignals,
    action_items: actionItems,
    general_summary: summary.executive_summary,
    opportunities,
    buyer_roles_present: summary.buyer_roles_present ?? [],
  };
}
