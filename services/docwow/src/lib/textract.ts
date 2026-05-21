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

/** Start a Textract job and return the job ID immediately. */
export async function startTextractJob(s3Key: string): Promise<string> {
  const startResp = await textract.send(
    new StartDocumentAnalysisCommand({
      DocumentLocation: { S3Object: { Bucket: BUCKET, Name: s3Key } },
      FeatureTypes: ['TABLES', 'FORMS'],
    })
  );
  if (!startResp.JobId) throw new Error('Textract did not return a JobId');
  return startResp.JobId;
}

export type TextractStatus =
  | { status: 'processing'; pagesProcessed: number }
  | { status: 'ready'; blocks: ExtractedBlock[]; pageCount: number }
  | { status: 'failed'; message: string };

/**
 * Check the current status of a Textract job.
 * If SUCCEEDED, collects all pages (following NextToken) and returns parsed blocks.
 * Designed to be called repeatedly by a polling frontend.
 */
export async function getTextractStatus(jobId: string): Promise<TextractStatus> {
  // Collect all result pages when job is done
  let allBlocks: Block[] = [];
  let nextToken: string | undefined;
  let jobStatus: string | undefined;
  let pagesProcessedSoFar = 0;

  do {
    const resp = await textract.send(
      new GetDocumentAnalysisCommand({ JobId: jobId, NextToken: nextToken })
    );
    jobStatus = resp.JobStatus;
    // DocumentMetadata.Pages reflects pages analyzed so far, even while IN_PROGRESS
    pagesProcessedSoFar = resp.DocumentMetadata?.Pages ?? pagesProcessedSoFar;

    if (jobStatus === 'FAILED') {
      return { status: 'failed', message: resp.StatusMessage ?? 'Textract job failed' };
    }

    if (jobStatus === 'SUCCEEDED') {
      if (resp.Blocks) allBlocks = allBlocks.concat(resp.Blocks);
      nextToken = resp.NextToken;
    }
  } while (jobStatus === 'SUCCEEDED' && nextToken);

  if (jobStatus === 'IN_PROGRESS' || jobStatus === 'PARTIAL_SUCCESS') {
    return { status: 'processing', pagesProcessed: pagesProcessedSoFar };
  }

  // SUCCEEDED — parse blocks
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
      extracted.push({ id: Id, pageNumber: Page, type: 'text', text: block.Text ?? '', bbox, confidence: Confidence ?? 0 });
    } else if (BlockType === 'TABLE') {
      const cellTexts = collectChildText(block, blockMap);
      if (cellTexts.trim()) {
        extracted.push({ id: Id, pageNumber: Page, type: 'table', text: cellTexts, bbox, confidence: Confidence ?? 0 });
      }
    } else if (BlockType === 'KEY_VALUE_SET' && block.EntityTypes?.includes('KEY')) {
      const keyText = collectChildText(block, blockMap);
      const valueBlock = findValueBlock(block, blockMap);
      const valueText = valueBlock ? collectChildText(valueBlock, blockMap) : '';
      const combined = `${keyText}: ${valueText}`.trim();
      if (combined !== ':') {
        extracted.push({ id: Id, pageNumber: Page, type: 'key-value', text: combined, bbox, confidence: Confidence ?? 0 });
      }
    }
  }

  const pageCount = allBlocks.filter((b) => b.BlockType === 'PAGE').length;
  return { status: 'ready', blocks: extracted, pageCount };
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
