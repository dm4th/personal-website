"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSession = saveSession;
exports.getSession = getSession;
exports.updateAgentStatus = updateAgentStatus;
exports.updateSession = updateSession;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
const ddb = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const TABLE = process.env.DYNAMO_TABLE ?? 'notion-meeting-sessions';
const SESSION_TTL_SECONDS = 2 * 60 * 60; // 2 hours
async function saveSession(session) {
    const now = Math.floor(Date.now() / 1000);
    await ddb.send(new lib_dynamodb_1.PutCommand({
        TableName: TABLE,
        Item: { ...session, createdAt: new Date().toISOString(), ttl: now + SESSION_TTL_SECONDS },
    }));
}
async function getSession(sessionId) {
    const result = await ddb.send(new lib_dynamodb_1.GetCommand({ TableName: TABLE, Key: { sessionId } }));
    return result.Item ?? null;
}
async function updateAgentStatus(sessionId, agentName, status) {
    await ddb.send(new lib_dynamodb_1.UpdateCommand({
        TableName: TABLE,
        Key: { sessionId },
        UpdateExpression: 'SET agentStatuses.#agent = :s',
        ExpressionAttributeNames: { '#agent': agentName },
        ExpressionAttributeValues: { ':s': status },
    }));
}
async function updateSession(sessionId, updates) {
    if (updates.status === 'ready') {
        await ddb.send(new lib_dynamodb_1.UpdateCommand({
            TableName: TABLE,
            Key: { sessionId },
            UpdateExpression: 'SET #s = :s, results = :r',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':s': 'ready', ':r': updates.results },
        }));
    }
    else {
        await ddb.send(new lib_dynamodb_1.UpdateCommand({
            TableName: TABLE,
            Key: { sessionId },
            UpdateExpression: 'SET #s = :s, #e = :e',
            ExpressionAttributeNames: { '#s': 'status', '#e': 'error' },
            ExpressionAttributeValues: { ':s': 'failed', ':e': updates.error },
        }));
    }
}
//# sourceMappingURL=dynamo.js.map