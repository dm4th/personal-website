import { searchContent, searchContentTool, type SearchContentInput } from './searchContent';
import { analyzeJdFit, analyzeJdFitTool, type JdFitInput } from './analyzeJdFit';
import { composeEmail, composeEmailTool, type ComposeEmailInput } from './composeEmail';

export const TOOL_DEFINITIONS = [searchContentTool, analyzeJdFitTool, composeEmailTool] as const;

export type ToolName = 'search_content' | 'analyze_jd_fit' | 'compose_email_to_danny';

export async function runTool(
  name: string,
  input: Record<string, unknown>,
): Promise<{ content: string; summary: string; isError?: boolean }> {
  if (name === 'search_content') {
    const result = await searchContent(input as SearchContentInput);
    if (result.ok) {
      const d = result.data;
      const summary =
        Array.isArray(d) ? `Listed ${d.length} item${d.length !== 1 ? 's' : ''}`
        : 'matches' in d ? `Found ${d.matches.length} match${d.matches.length !== 1 ? 'es' : ''}`
        : 'File read';
      return { content: JSON.stringify(d), summary };
    }
    return { content: JSON.stringify({ error: result.error }), summary: 'Search error', isError: true };
  }

  if (name === 'analyze_jd_fit') {
    const result = await analyzeJdFit(input as JdFitInput);
    if (result.ok) {
      return { content: JSON.stringify(result.data), summary: result.summary };
    }
    return { content: JSON.stringify({ error: result.error }), summary: 'Analysis error', isError: true };
  }

  if (name === 'compose_email_to_danny') {
    const result = await composeEmail(input as ComposeEmailInput);
    if (result.ok) {
      return { content: JSON.stringify(result.data), summary: result.summary };
    }
    return { content: JSON.stringify({ error: result.error }), summary: 'Draft error', isError: true };
  }

  return { content: JSON.stringify({ error: `Unknown tool: ${name}` }), summary: 'Unknown tool', isError: true };
}
