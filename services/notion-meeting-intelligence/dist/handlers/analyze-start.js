"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const dynamo_1 = require("../lib/dynamo");
async function handler(event) {
    let body;
    try {
        body = JSON.parse(event.body ?? '{}');
    }
    catch {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }
    const { sessionId, transcript, meeting_type, agentPrompts } = body;
    if (!sessionId || !transcript || !agentPrompts) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing required fields' }) };
    }
    await (0, dynamo_1.saveSession)({ sessionId, status: 'processing', transcript, meeting_type: meeting_type ?? 'Other', agentPrompts });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) };
}
//# sourceMappingURL=analyze-start.js.map