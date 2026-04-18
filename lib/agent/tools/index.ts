import { searchContent, searchContentTool, type SearchContentInput } from './searchContent';

export const TOOL_DEFINITIONS = [searchContentTool] as const;

export type ToolName = 'search_content';

export async function runTool(
  name: string,
  input: Record<string, unknown>,
): Promise<{ content: string; isError?: boolean }> {
  if (name === 'search_content') {
    const result = await searchContent(input as SearchContentInput);
    return {
      content: JSON.stringify(result.ok ? result.data : { error: result.error }),
      isError: !result.ok,
    };
  }
  return { content: JSON.stringify({ error: `Unknown tool: ${name}` }), isError: true };
}
