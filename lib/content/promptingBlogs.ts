import client from './contentful';

export type PromptingPost = {
  id: string;
  title?: string;
  date?: string;
  intro?: unknown;
  takeaways?: unknown;
  conversations?: unknown;
  [key: string]: unknown;
};

export async function getSortedPostsData(): Promise<PromptingPost[]> {
  const entries = await client.getEntries({ content_type: 'dailyPromptingBlog' });
  const allPostsData: PromptingPost[] = entries.items.map((item) => ({
    id: item.sys.id,
    ...(item.fields as Record<string, unknown>),
  }));

  return allPostsData.sort((a, b) => {
    const da = (a.date as string | undefined) ?? '';
    const db = (b.date as string | undefined) ?? '';
    return da < db ? 1 : -1;
  });
}

export async function getAllPostIds(): Promise<Array<{ params: { id: string } }>> {
  const entries = await client.getEntries({ content_type: 'dailyPromptingBlog' });
  return entries.items.map((item) => ({ params: { id: item.sys.id } }));
}

export async function getPostData(id: string): Promise<PromptingPost> {
  const entry = await client.getEntry(id);
  return { id, ...(entry.fields as Record<string, unknown>) };
}
