import {
  TextractClient,
  StartDocumentAnalysisCommand,
  GetDocumentAnalysisCommand,
  type Block,
} from '@aws-sdk/client-textract';
import type { ExtractedBlock, BoundingBox } from './types';

// Explicitly resolve credentials including session token (required for Lambda execution roles)
const credentials = process.env.AWS_ACCESS_KEY_ID
  ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      sessionToken: process.env.AWS_SESSION_TOKEN,
    }
  : undefined;

const textract = new TextractClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  ...(credentials && { credentials }),
});
const BUCKET = process.env.AWS_S3_BUCKET_NAME ?? '';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // 2 minutes max

/**
 * Start async Textract analysis and poll until completion.
 * Returns parsed ExtractedBlock[] from LINE, TABLE, and KEY_VALUE_SET blocks.
 */
export async function analyzeDocument(s3Key: string): Promise<{ blocks: ExtractedBlock[]; pageCount: number }> {
  // Start async job
  const startResp = await textract.send(
    new StartDocumentAnalysisCommand({
      DocumentLocation: {
        S3Object: { Bucket: BUCKET, Name: s3Key },
      },
      FeatureTypes: ['TABLES', 'FORMS'],
    })
  );

  const jobId = startResp.JobId;
  if (!jobId) {
    throw new Error('Textract did not return a JobId');
  }

  // Poll until complete
  let allBlocks: Block[] = [];
  let pageCount = 0;
  let nextToken: string | undefined;

  for (let poll = 0; poll < MAX_POLLS; poll++) {
    await sleep(POLL_INTERVAL_MS);

    const getResp = await textract.send(
      new GetDocumentAnalysisCommand({ JobId: jobId, NextToken: nextToken })
    );

    if (getResp.JobStatus === 'FAILED') {
      throw new Error(`Textract job failed: ${getResp.StatusMessage ?? 'unknown reason'}`);
    }

    if (getResp.Blocks) {
      allBlocks = allBlocks.concat(getResp.Blocks);
    }

    nextToken = getResp.NextToken;

    if (getResp.JobStatus === 'SUCCEEDED' && !nextToken) {
      // Count pages from PAGE blocks
      pageCount = allBlocks.filter((b) => b.BlockType === 'PAGE').length;
      break;
    }

    if (poll === MAX_POLLS - 1) {
      throw new Error('Textract job timed out after 2 minutes');
    }
  }

  // Build a map from block ID to block for relationship traversal
  const blockMap = new Map<string, Block>();
  for (const b of allBlocks) {
    if (b.Id) blockMap.set(b.Id, b);
  }

  const extracted: ExtractedBlock[] = [];

  for (const block of allBlocks) {
    const { BlockType, Id, Page, Geometry, Confidence } = block;

    if (!Id || !Geometry?.BoundingBox || !Page) continue;

    const bbox: BoundingBox = {
      left: Geometry.BoundingBox.Left ?? 0,
      top: Geometry.BoundingBox.Top ?? 0,
      width: Geometry.BoundingBox.Width ?? 0,
      height: Geometry.BoundingBox.Height ?? 0,
    };

    if (BlockType === 'LINE') {
      extracted.push({
        id: Id,
        pageNumber: Page,
        type: 'text',
        text: block.Text ?? '',
        bbox,
        confidence: Confidence ?? 0,
      });
    } else if (BlockType === 'TABLE') {
      // Collect all CELL children text
      const cellTexts = collectChildText(block, blockMap);
      if (cellTexts.trim()) {
        extracted.push({
          id: Id,
          pageNumber: Page,
          type: 'table',
          text: cellTexts,
          bbox,
          confidence: Confidence ?? 0,
        });
      }
    } else if (BlockType === 'KEY_VALUE_SET' && block.EntityTypes?.includes('KEY')) {
      // Pair KEY with VALUE
      const keyText = collectChildText(block, blockMap);
      const valueBlock = findValueBlock(block, blockMap);
      const valueText = valueBlock ? collectChildText(valueBlock, blockMap) : '';
      const combined = `${keyText}: ${valueText}`.trim();
      if (combined !== ':') {
        extracted.push({
          id: Id,
          pageNumber: Page,
          type: 'key-value',
          text: combined,
          bbox,
          confidence: Confidence ?? 0,
        });
      }
    }
  }

  return { blocks: extracted, pageCount };
}

function collectChildText(block: Block, blockMap: Map<string, Block>): string {
  const parts: string[] = [];
  for (const rel of block.Relationships ?? []) {
    if (rel.Type === 'CHILD') {
      for (const childId of rel.Ids ?? []) {
        const child = blockMap.get(childId);
        if (child?.BlockType === 'WORD' && child.Text) {
          parts.push(child.Text);
        } else if (child?.BlockType === 'CELL') {
          parts.push(collectChildText(child, blockMap));
        }
      }
    }
  }
  return parts.join(' ');
}

function findValueBlock(keyBlock: Block, blockMap: Map<string, Block>): Block | null {
  for (const rel of keyBlock.Relationships ?? []) {
    if (rel.Type === 'VALUE') {
      for (const id of rel.Ids ?? []) {
        const b = blockMap.get(id);
        if (b) return b;
      }
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
