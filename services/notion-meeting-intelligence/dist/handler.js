"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const analyze_start_1 = require("./handlers/analyze-start");
const analyze_execute_1 = require("./handlers/analyze-execute");
const analyze_status_1 = require("./handlers/analyze-status");
const analyze_results_1 = require("./handlers/analyze-results");
const SECRET = process.env.NOTION_MEETING_SECRET ?? '';
async function handler(event) {
    const incoming = event.headers?.['x-notion-meeting-secret'] ?? event.headers?.['X-Notion-Meeting-Secret'];
    if (SECRET && incoming !== SECRET) {
        return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const path = event.path ?? '';
    const method = event.httpMethod?.toUpperCase() ?? 'GET';
    if (path.endsWith('/analyze/start') && method === 'POST')
        return (0, analyze_start_1.handler)(event);
    if (path.endsWith('/analyze/execute') && method === 'POST')
        return (0, analyze_execute_1.handler)(event);
    if (path.endsWith('/analyze/status') && method === 'GET')
        return (0, analyze_status_1.handler)(event);
    if (path.endsWith('/analyze/results') && method === 'GET')
        return (0, analyze_results_1.handler)(event);
    return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: `Unknown path: ${path}` }) };
}
//# sourceMappingURL=handler.js.map