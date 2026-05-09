export type SalesAnalysis = {
  overall_score: number; // 1–10
  strengths: string[]; // 2–4 items
  improvement_areas: string[]; // 2–4 items
  best_moment: string;
  coaching_tip: string;
  talk_time_balance: 'Good balance' | 'Too much rep talk' | 'Too little rep talk';
  objection_handling: 'Strong' | 'Adequate' | 'Missed opportunities';
};

export type CommercialAnalysis = {
  deal_tier: 'Strategic' | 'Growth' | 'SMB' | 'Unqualified';
  estimated_acv_range: string; // e.g. "$80K – $120K"
  price_sensitivity: 'Low' | 'Medium' | 'High';
  budget_signals: string[]; // 1–3 items
  pricing_risk: string;
  recommended_approach: string;
  contract_complexity: 'Standard' | 'Custom' | 'Enterprise MSA Required';
};

export type DeliveryAnalysis = {
  complexity_score: number; // 1–10
  custom_requirements: string[]; // 0–4 items
  deployment_model: 'Cloud' | 'On-Prem' | 'Hybrid' | 'Not discussed';
  technical_requirements: string[]; // 2–4 items
  integration_needs: string[]; // 0–3 items
  delivery_risk: 'Low' | 'Medium' | 'High';
  se_recommendation: string;
};

export type ProductAnalysis = {
  resonated_features: string[]; // 2–4 items
  weak_features: string[]; // 0–3 items
  competitive_gaps: string[]; // 0–3 items
  notable_quotes: string[]; // 1–3 items
  feedback_priority: 'High' | 'Medium' | 'Low';
  product_team_insight: string;
};

export type ICPDimensionScore = {
  dimension: string;
  score: number; // 1–5
  weight: number; // decimal e.g. 0.25
  evidence: string;
};

export type ICPAnalysis = {
  overall_icp_score: number; // 1.0–5.0
  icp_tier: 'Tier 1 🟢' | 'Tier 2 🟡' | 'Tier 3 🔴';
  dimension_scores: ICPDimensionScore[];
  fit_summary: string;
  disqualifying_flags: string[]; // 0–2 items
  recommendation: 'Full engagement' | 'Standard coverage' | 'Light touch';
};

export type SummaryAgentRelevance = {
  agent: 'sales' | 'commercial' | 'delivery' | 'product' | 'icp';
  relevance_score: number; // 1-10: how central was this agent's angle to THIS call
  reason: string;
};

export type SummaryAnalysis = {
  executive_summary: string; // 3-4 sentences
  deal_verdict: 'Strong Opportunity' | 'Qualified Pipeline' | 'Needs Qualification' | 'Pass';
  top_signals: string[]; // 3 most important signals across all agents
  recommended_next_action: string; // 1-2 sentences
  agent_relevance: SummaryAgentRelevance[];
  buyer_roles_present: string[]; // buyer-side attendees extracted from transcript, e.g. ["Sarah - CTO", "Mike - VP Sales"]
};

export type AgentResults = {
  sales: SalesAnalysis;
  commercial: CommercialAnalysis;
  delivery: DeliveryAnalysis;
  product: ProductAnalysis;
  icp: ICPAnalysis;
  summary: SummaryAnalysis;
};

export type MeetingMetadata = {
  meeting_title: string;
  meeting_date: string; // ISO date
  company_name: string;
  meeting_type: string;
  engagement_score: number; // sales.overall_score × 10 → 10–100
  sentiment: '🟢 Positive' | '🟡 Neutral' | '🔴 Negative';
  stage_after_meeting: 'Move forward' | 'Hold' | 'De-prioritize' | 'Re-qualify ICP';
  key_signals: string[]; // top 3 across all agents
  action_items: string[]; // top 3 from delivery + commercial
  general_summary: string; // from summary agent executive_summary
  opportunities: string; // commercial intelligence text
  buyer_roles_present: string[]; // from summary agent
  recording_link?: string; // optional, provided by caller
};

export type AgentAnalyzeRequest = {
  transcript: string;
  meeting_type?: string;
};

export type AgentAnalyzeResponse = {
  results: AgentResults;
  metadata: MeetingMetadata;
};

export type CreatePageRequest = {
  notion_token: string;
  meeting_notes_db_id: string;
  agent_analyses_db_id: string;
  results: AgentResults;
  metadata: MeetingMetadata;
};

export type CreatePageResponse = {
  meeting_page_url: string;
  agent_analysis_urls: string[];
};

export type NotionConfigGetResponse = {
  meeting_notes_db_id: string | null;
  agent_analyses_db_id: string | null;
  agent_library_db_id: string | null;
  icp_rubric_db_id: string | null;
  has_token: boolean;
};

export type NotionConfigSaveRequest = {
  notion_token?: string;
  meeting_notes_db_id?: string;
  agent_analyses_db_id?: string;
  agent_library_db_id?: string;
  icp_rubric_db_id?: string;
};

export type TranscriptSample = {
  id: string;
  label: string;
  company: string;
  meeting_type: string;
  duration_hint: string;
  transcript: string;
};

export type MeetingDemoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; results: AgentResults; metadata: MeetingMetadata }
  | { status: 'error'; message: string };

export type NotionConnectState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; meeting_page_url: string; agent_analysis_urls: string[] }
  | { status: 'error'; message: string };

export type ActiveTab = 'summary' | 'sales' | 'commercial' | 'delivery' | 'product' | 'icp';
