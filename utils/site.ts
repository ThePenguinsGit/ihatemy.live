export const SITE_NAME = 'The PenguinNetwork';
export const SITE_DOMAIN = 'ihatemy.live';
export const SITE_URL = `https://${SITE_DOMAIN}`;
export const siteUrl = (path = '/') => `${SITE_URL}${path === '/' ? '' : path}`;
export const subdomain = (name: string) => `https://${name}.${SITE_DOMAIN}`;
export const serverHostname = (shortName: string) => `${shortName}.${SITE_DOMAIN}`;

export const SITE_PLACEHOLDERS: Record<string, string> = {
  '{siteName}': SITE_NAME,
  '{siteDomain}': SITE_DOMAIN,
  '{siteUrl}': SITE_URL,
};

export function resolveSiteComponents(markdown: string): string {
  return markdown.replace(
    /:(site-name|site-domain|server-host)(\{[^}]*\})?/g,
    (match, tag: string, attrs = '') => {
      const attr = (name: string) => attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1]

      switch (tag) {
        case 'site-name': return SITE_NAME
        case 'site-domain': {
          const sub = attr('sub')
          return sub ? `${sub}.${SITE_DOMAIN}` : SITE_DOMAIN
        }
        case 'server-host': {
          const shortName = attr('short-name')
          return shortName ? serverHostname(shortName) : match
        }
        default: return match
      }
    },
  )
}

/**
 * Expand placeholders through a whole frontmatter object: nested config like
 * `itemlist.name` or `howto.steps` is metadata too, and authors shouldn't have
 * to remember which fields are wired up.
 */
export function resolveSitePlaceholdersDeep<T>(value: T, skipKeys: string[] = []): T {
  if (typeof value === 'string') return resolveSitePlaceholders(value)

  if (Array.isArray(value)) {
    return value.map(item => resolveSitePlaceholdersDeep(item, skipKeys)) as T
  }

  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (skipKeys.includes(key)) continue
      (value as Record<string, unknown>)[key] = resolveSitePlaceholdersDeep(item, skipKeys)
    }
  }

  return value
}

export function resolveSitePlaceholders<T>(value: T): T {
  if (typeof value !== 'string') return value

  let out: string = value
  for (const [token, replacement] of Object.entries(SITE_PLACEHOLDERS)) {
    out = out.replaceAll(token, replacement)
  }
  return out as T
}
