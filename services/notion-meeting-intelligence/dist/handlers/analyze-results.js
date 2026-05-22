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
    if (session.status !== 'ready') {
        return { statusCode: 409, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Results not ready' }) };
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ results: session.results }) };
}
//# sourceMappingURL=analyze-results.js.map