/**
 * Entries per gallery page. Shared by `pages/gallery.vue` (the `?page=` paging)
 * and the sitemap's gallery image source in `nuxt.config.ts`, so the images
 * listed for a URL are the ones that URL actually renders.
 */
export const GALLERY_PER_PAGE = 24;

/** Longest alt text we emit; captions are free-form Discord messages. */
const ALT_MAX = 160;

const decodeEntities = (s: string) => s
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#0?39;/g, "'")
  .replace(/&amp;/g, '&');

/**
 * Alt text for a gallery screenshot.
 *
 * Prefers `contentHtml`, whose Discord mentions are already resolved to
 * usernames, stripped back to plain text — the raw `content` field still holds
 * markup like `<@162441799753924614>`, which is meaningless to a reader or a
 * crawler. Falls back to `content` with the mention tokens removed (entries
 * keep an empty `contentHtml` until they are re-synced), then to the author.
 */
export function galleryAltText(entry: { content: string, contentHtml: string, authorUsername: string }): string {
  const fromHtml = entry.contentHtml
    ? decodeEntities(entry.contentHtml.replace(/<[^>]*>/g, ' '))
    : '';

  const caption = (fromHtml || entry.content.replace(/<(?:@[!&]?|#)\d+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

  if (!caption) return `Screenshot by ${entry.authorUsername}`;

  return caption.length > ALT_MAX ? `${caption.slice(0, ALT_MAX - 1).trimEnd()}…` : caption;
}
