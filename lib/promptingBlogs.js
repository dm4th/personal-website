import client from './contentful';

export async function getSortedPostsData() {
  const entries = await client.getEntries({ content_type: 'dailyPromptingBlog' });
  const allPostsData = entries.items.map((item) => ({
    id: item.sys.id,
    ...item.fields,
  }));

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getAllPostIds() {
  const entries = await client.getEntries({ content_type: 'dailyPromptingBlog' });
  return entries.items.map((item) => ({
    params: {
      id: item.sys.id,
    },
  }));
}

export async function getPostData(id) {
  const entry = await client.getEntry(id);
  return {
    id,
    ...entry.fields,
  };
}
