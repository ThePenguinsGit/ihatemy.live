// API catalog (RFC 9727) as a linkset (RFC 9264) so agents can discover the
// site's machine-readable endpoints. Advertised from the homepage via the
// Link: rel="api-catalog" header in nuxt.config routeRules.
export default defineEventHandler((event) => {
  const site = useRuntimeConfig().public
  const siteUrl = 'https://ihatemy.live'

  const linkset = {
    linkset: [
      {
        // PenguBot public API: live server status, leaderboards, playtime.
        anchor: `${site.apiBaseUrl}/`,
        'service-doc': [
          { href: `${siteUrl}/docs/getting-started`, type: 'text/html' },
        ],
        describedby: [
          { href: `${siteUrl}/llms.txt`, type: 'text/markdown' },
        ],
        status: [
          { href: `${site.apiBaseUrl}/all-alive-servers` },
        ],
      },
      {
        // Website API: public docs index (everything else under /api/ needs a
        // browser session and is proxied to PenguBot).
        anchor: `${siteUrl}/api/docs`,
        'service-doc': [
          { href: `${siteUrl}/docs/getting-started`, type: 'text/html' },
        ],
        describedby: [
          { href: `${siteUrl}/llms-full.txt`, type: 'text/markdown' },
        ],
      },
    ],
  }

  setHeader(event, 'Content-Type', 'application/linkset+json')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return JSON.stringify(linkset, null, 2)
})
