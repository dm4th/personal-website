import fs from 'fs';
import path from 'path';

const INFO_ROOT = path.join(process.cwd(), 'info');
const ALLOWED_CATEGORIES = ['about-me', 'career', 'ai-ml', 'projects'] as const;

/** Guard against path traversal */
function safeResolvePath(relative: string): string | null {
  const resolved = path.resolve(INFO_ROOT, relative);
  if (!resolved.startsWith(INFO_ROOT + path.sep) && resolved !== INFO_ROOT) return null;
  return resolved;
}

export type SearchContentInput =
  | { action: 'list'; category?: string }
  | { action: 'read'; path: string }
  | { action: 'grep'; pattern: string; category?: string };

export type FileEntry = { name: string; type: 'file' | 'directory'; path: string };
export type FileMatch = { file: string; line: number; text: string };
export type SearchContentData =
  | FileEntry[]
  | { path: string; content: string }
  | { pattern: string; matches: FileMatch[] };

export type SearchContentResult =
  | { ok: true; data: SearchContentData }
  | { ok: false; error: string };

export async function searchContent(input: SearchContentInput): Promise<SearchContentResult> {
  try {
    if (input.action === 'list') {
      const dir = input.category
        ? safeResolvePath(input.category)
        : INFO_ROOT;

      if (!dir) return { ok: false, error: 'Invalid path' };
      if (!fs.existsSync(dir)) return { ok: false, error: `Directory not found: ${input.category}` };

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files = entries
        .filter((e) => !e.name.startsWith('.'))
        .map((e) => ({
          name: e.name,
          type: (e.isDirectory() ? 'directory' : 'file') as 'file' | 'directory',
          path: input.category ? `${input.category}/${e.name}` : e.name,
        }));
      return { ok: true, data: files };
    }

    if (input.action === 'read') {
      const filePath = input.path.endsWith('.md') ? input.path : `${input.path}.md`;
      const resolved = safeResolvePath(filePath);
      if (!resolved) return { ok: false, error: 'Invalid path' };
      if (!fs.existsSync(resolved)) return { ok: false, error: `File not found: ${input.path}` };

      const content = fs.readFileSync(resolved, 'utf8');
      return { ok: true, data: { path: input.path, content } };
    }

    if (input.action === 'grep') {
      const pattern = new RegExp(input.pattern, 'gi');
      const results: Array<{ file: string; line: number; text: string }> = [];

      const searchDir = (dir: string, prefix: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const fullPath = path.join(dir, entry.name);
          const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            searchDir(fullPath, relPath);
          } else if (entry.name.endsWith('.md')) {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            lines.forEach((line, i) => {
              if (pattern.test(line)) {
                results.push({ file: relPath, line: i + 1, text: line.trim() });
                pattern.lastIndex = 0; // reset stateful regex
              }
            });
          }
        }
      };

      const searchRoot = input.category ? safeResolvePath(input.category) : INFO_ROOT;
      if (!searchRoot) return { ok: false, error: 'Invalid category' };
      searchDir(searchRoot, input.category ?? '');

      return { ok: true, data: { pattern: input.pattern, matches: results.slice(0, 50) } };
    }

    return { ok: false, error: 'Unknown action' };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/** Anthropic tool definition for search_content */
export const searchContentTool = {
  name: 'search_content',
  description:
    "Search Dan's content files in /info. Use 'list' to browse directories, 'read' to read a full file, or 'grep' to search for keywords across files. Always search before answering factual questions.",
  input_schema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'read', 'grep'],
        description: "The search action: 'list' directories, 'read' a file, or 'grep' for a pattern",
      },
      category: {
        type: 'string',
        enum: [...ALLOWED_CATEGORIES],
        description: "Optional: scope to a specific category directory (about-me, career, ai-ml, projects)",
      },
      path: {
        type: 'string',
        description: "For 'read': relative path like 'career/thoughtful' or 'career/thoughtful.md'",
      },
      pattern: {
        type: 'string',
        description: "For 'grep': regex-compatible search pattern",
      },
    },
    required: ['action'],
  },
} as const;
