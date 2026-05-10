/**
 * POST /api/projects/notion-meeting-intelligence/search-workspace
 *
 * Accepts the user's Notion integration token and returns all databases the
 * integration can access. Uses the data_source search filter (the only valid
 * database filter in @notionhq/client v5), but reads the PAGE ID from ds.url
 * rather than ds.id — because ds.id is the internal collection ID, while
 * ds.url contains the canonical URL whose path segment is the database PAGE ID
 * that pages.create({ parent: { database_id } }) actually requires.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Client, isFullDataSource } from '@notionhq/client';
import { z } from 'zod';

const RequestSchema = z.object({
  notion_token: z.string().min(10),
});

/** Extract the 32-char hex page ID from a Notion URL like https://www.notion.so/abc123... */
function pageIdFromUrl(url: string): string | null {
  const match = url.match(/([0-9a-f]{32})(?:[?#]|$)/i);
  return match ? match[1] : null;
}

/** Format a 32-char hex ID as a UUID with hyphens */
function toUUID(id: string): string {
  return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'notion_token is required' }, { status: 400 });
  }

  const notion = new Client({ auth: parsed.data.notion_token });

  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'data_source' },
      page_size: 100,
    });

    const databases = response.results
      .filter(isFullDataSource)
      .map((ds) => {
        const name = ds.title.map((b) => b.plain_text).join('');
        // ds.id is the collection/data_source ID — NOT the same as the database page ID.
        // ds.url is "https://www.notion.so/<pageId>?v=..." — extract the 32-char page ID
        // from the URL. This is what pages.create({ parent: { database_id } }) needs.
        const pageId = pageIdFromUrl(ds.url);
        const id = pageId ? toUUID(pageId) : ds.id; // fallback to ds.id if URL parse fails
        return { id, name };
      })
      .filter((db) => db.name.length > 0);

    return NextResponse.json({ databases });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Notion search failed', detail: message },
      { status: 502 },
    );
  }
}
