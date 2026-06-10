const ALLOWED_HOSTS = new Set([
  'www.loom.com',
  'loom.com',
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtu.be',
]);

/**
 * Normalizes a share URL to its embeddable form, or returns null when the
 * URL is missing, unparseable, or not on the allowed host list.
 */
export function toEmbedUrl(raw?: string): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (!ALLOWED_HOSTS.has(url.hostname)) return null;

  // Loom: /share/<id> -> /embed/<id>
  if (url.hostname.endsWith('loom.com')) {
    return `https://www.loom.com${url.pathname.replace('/share/', '/embed/')}`;
  }
  // YouTube short links: youtu.be/<id> -> embed
  if (url.hostname === 'youtu.be') {
    return `https://www.youtube-nocookie.com/embed${url.pathname}`;
  }
  // YouTube watch links -> embed
  const videoId = url.searchParams.get('v');
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  // Already an embed path
  if (url.pathname.startsWith('/embed/')) return url.toString();
  return null;
}
