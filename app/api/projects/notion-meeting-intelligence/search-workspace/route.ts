/**
 * POST /api/projects/notion-meeting-intelligence/search-workspace
 *
 * Accepts the user's Notion integration token and returns all data sources
 * (databases) the integration has access to. The client uses this to
 * auto-populate the four DB ID fields in the workspace setup modal.
 *
 * Note: in @notionhq/client v5, databases are "data_source" objects.
 * The search filter must use value: "data_source" — not "database".
 */

import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import type { DataSourceObjectResponse } from '@notionhq/client';
import { z } from 'zod';

const RequestSchema = z.object({
  notion_token: z.string().min(10),
});

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
      .filter((r): r is DataSourceObjectResponse => r.object === 'data_source' && 'title' in r)
      .map((ds) => {
        const name = ds.title.map((b) => b.plain_text).join('');
        return { id: ds.id.replace(/-/g, ''), name };
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
