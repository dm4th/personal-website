"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const dynamo_1 = require("../lib/dynamo");
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
const ok = { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
async function callClaude(systemPrompt, userMessage) {
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
    });
    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
    return JSON.parse(cleaned);
}
async function handler(event) {
    let body;
    try {
        body = JSON.parse(event.body ?? '{}');
    }
    catch {
        return ok;
    }
    const { sessionId } = body;
    if (!sessionId)
        return ok;
    const session = await (0, dynamo_1.getSession)(sessionId);
    if (!session)
        return ok;
    const { transcript, agentPrompts } = session;
    const transcriptMsg = `Meeting transcript:\n\n${transcript}`;
    try {
        // Phase 1: 5 parallel agents
        const [sales, commercial, delivery, product, icp] = await Promise.all([
            callClaude(agentPrompts['sales'], transcriptMsg),
            callClaude(agentPrompts['commercial'], transcriptMsg),
            callClaude(agentPrompts['delivery'], transcriptMsg),
            callClaude(agentPrompts['product'], transcriptMsg),
            callClaude(agentPrompts['icp'], transcriptMsg),
        ]);
        // Phase 2: summary agent receives all 5 results
        const summaryMsg = [
            transcriptMsg, '---', 'Agent analysis results:',
            `SALES ANALYSIS:\n${JSON.stringify(sales, null, 2)}`,
            `COMMERCIAL ANALYSIS:\n${JSON.stringify(commercial, null, 2)}`,
            `DELIVERY ANALYSIS:\n${JSON.stringify(delivery, null, 2)}`,
            `PRODUCT ANALYSIS:\n${JSON.stringify(product, null, 2)}`,
            `ICP ANALYSIS:\n${JSON.stringify(icp, null, 2)}`,
        ].join('\n\n');
        const summary = await callClaude(agentPrompts['summary'], summaryMsg);
        await (0, dynamo_1.updateSession)(sessionId, { status: 'ready', results: { sales, commercial, delivery, product, icp, summary } });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        await (0, dynamo_1.updateSession)(sessionId, { status: 'failed', error: message });
    }
    return ok;
}
//# sourceMappingURL=analyze-execute.js.map