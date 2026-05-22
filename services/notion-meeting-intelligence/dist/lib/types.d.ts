export type AgentStatus = 'pending' | 'processing' | 'ready' | 'failed';
export interface NotionAnalyzeSession {
    sessionId: string;
    status: 'processing' | 'ready' | 'failed';
    transcript: string;
    meeting_type: string;
    agentPrompts: Record<string, string>;
    agentStatuses?: Record<string, AgentStatus>;
    results?: unknown;
    error?: string;
    createdAt: string;
    ttl: number;
}
//# sourceMappingURL=types.d.ts.map