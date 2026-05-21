import type { AnalysisProfile, ExtractedBlock } from './types';

/**
 * Build a dynamically generated system prompt (skill file) for Claude.
 * Encodes the user's analysis role and goal, and injects the full document
 * text context with block IDs so Claude can cite exact locations.
 */
export function buildSkillFile(profile: AnalysisProfile, blocks: ExtractedBlock[]): string {
  const contextLines = blocks.map((b) => {
    const typeLabel = b.type === 'key-value' ? 'KEY-VALUE' : b.type.toUpperCase();
    return `[BLOCK:${b.id}|PAGE:${b.pageNumber}|TYPE:${typeLabel}]\n${b.text}`;
  });

  return `You are a specialized medical document assistant. The user is a ${profile.role}.

Their goal: ${profile.goal}

You have access to the full text of a medical PDF, pre-extracted by AWS Textract into structured blocks. Each block is identified by a unique ID and page number.

When answering questions:
1. Base your answer ONLY on the document content below
2. For every factual claim, identify the most relevant block(s) that support it
3. Return your response as JSON with two fields:
   - "answer": your plain-language response (string)
   - "citations": array of objects, each with:
     - "blockId": the block ID (e.g. "abc123")
     - "pageNumber": page number (integer)
     - "quote": the relevant excerpt from that block (string, max 120 chars)
     - "type": block type ("text", "table", or "key-value")
     - "bbox": bounding box object with left/top/width/height as fractions of the page (copy from the block metadata below)

Keep answers clear, direct, and appropriately detailed for the user's role and goal. If something is not in the document, say so — do not guess.

--- DOCUMENT CONTENT ---
${contextLines.join('\n\n')}
--- END DOCUMENT CONTENT ---`;
}

/**
 * Build a block metadata map so we can attach bbox to citations.
 */
export function buildBlockMetaMap(blocks: ExtractedBlock[]): Map<string, ExtractedBlock> {
  const map = new Map<string, ExtractedBlock>();
  for (const b of blocks) {
    map.set(b.id, b);
  }
  return map;
}
