import type { NotionAnalyzeSession } from './types';
export declare function saveSession(session: Omit<NotionAnalyzeSession, 'createdAt' | 'ttl'>): Promise<void>;
export declare function getSession(sessionId: string): Promise<NotionAnalyzeSession | null>;
export declare function updateAgentStatus(sessionId: string, agentName: string, status: 'processing' | 'ready' | 'failed'): Promise<void>;
export declare function updateSession(sessionId: string, updates: {
    status: 'ready';
    results: unknown;
} | {
    status: 'failed';
    error: string;
}): Promise<void>;
//# sourceMappingURL=dynamo.d.ts.map