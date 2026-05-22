"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const dynamo_1 = require("../lib/dynamo");
async function handler(event) {
    const sessionId = event.queryStringParameters?.sessionId;
    if (!sessionId) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing sessionId' }) };
    }
    const session = await (0, dynamo_1.getSession)(sessionId);
    if (!session) {
        return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Session not found or expired' }) };
    }
    const { agentStatuses } = session;
    const body = session.status === 'ready' ? { status: 'ready', agentStatuses } :
        session.status === 'failed' ? { status: 'failed', error: session.error, agentStatuses } :
            { status: 'processing', agentStatuses };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
//# sourceMappingURL=analyze-status.js.map