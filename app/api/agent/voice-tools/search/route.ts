import { NextResponse } from 'next/server';
import { searchContent, type SearchContentInput } from '@/lib/agent/tools/searchContent';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const INFO_ROOT = path.join(process.cwd(), 'info');

/** Extract the paragraph (blank-line-delimited block) surrounding a matched line number. */
function extractParagraph(filePath: string, matchLine: number): string {
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    // Walk backward to find the paragraph start
    let start = matchLine - 1; // 0-indexed
    while (start > 0 && lines[start - 1].trim() !== '') start--;
    // Walk forward to find the paragraph end
    let end = matchLine - 1;
    while (end < lines.length - 1 && lines[end + 1].trim() !== '') end++;
    return lines.slice(start, end + 1).join('\n').trim();
  } catch {
    return '';
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log('[voice/search] →', JSON.stringify(body));
  const result = await searchContent(body as SearchContentInput);
  console.log('[voice/search] ←', result.ok ? `ok, ${JSON.stringify(result.data).length} chars` : `err: ${result.error}`);

  if (!result.ok) {
    return NextResponse.json({ result: `Search failed: ${result.error}` });
  }

  const d = result.data;
  let summary: string;

  if (Array.isArray(d)) {
    // list action — return file names so the agent knows what to read
    summary = d.map((e) => e.path).join(', ');
  } else if ('matches' in d) {
    if (d.matches.length === 0) {
      // Zero grep hits — tell the agent what files are available so it can try a read
      const category = (body.category as string) ?? '';
      const dir = category ? path.join(INFO_ROOT, category) : INFO_ROOT;
      let fallback = `No matches for "${d.pattern}".`;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const names = entries
          .filter((e) => !e.name.startsWith('.'))
          .map((e) => (category ? `${category}/${e.name}` : e.name));
        fallback += ` Available files: ${names.join(', ')}. Try reading one directly.`;
      } catch { /* ignore */ }
      summary = fallback;
    } else {
      // Return paragraph-level context for up to 3 unique files
      const seen = new Set<string>();
      const paragraphs: string[] = [];
      for (const m of d.matches) {
        if (seen.has(m.file)) continue;
        seen.add(m.file);
        const abs = path.join(INFO_ROOT, m.file);
        const para = extractParagraph(abs, m.line);
        if (para) paragraphs.push(`[${m.file}]\n${para}`);
        if (paragraphs.length >= 3) break;
      }
      summary = paragraphs.join('\n\n---\n\n') || d.matches.map((m) => m.text).slice(0, 5).join(' | ');
    }
  } else {
    // File read — return content, truncated for voice
    const content = 'content' in d ? d.content : JSON.stringify(d);
    summary = content.slice(0, 3000);
  }

  return NextResponse.json({ result: summary });
}
