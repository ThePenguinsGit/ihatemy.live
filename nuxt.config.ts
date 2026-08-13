// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { GALLERY_PER_PAGE } from "./utils/gallery";
import { SITE_DOMAIN, SITE_NAME, SITE_URL, resolveSiteComponents, resolveSitePlaceholders, resolveSitePlaceholdersDeep } from "./utils/site";
import type GalleryEntryInterface from "./interfaces/GalleryEntryInterface";
import type PaginatedResponseInterface from "./interfaces/PaginatedResponseInterface";

const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || 'https://penguin-bot.ihatemy.live'

const GALLERY_MAX_PAGES = 100

async function galleryImageUrls() {
  const urls: { loc: string, images: { loc: string }[], lastmod: string }[] = []

  for (let page = 1; page <= GALLERY_MAX_PAGES; page++) {
    let body: PaginatedResponseInterface<GalleryEntryInterface>
    try {
      const response = await fetch(`${apiBaseUrl}/gallery?page=${page}&perPage=${GALLERY_PER_PAGE}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      body = await response.json()
    } catch (error) {
      console.warn(`[sitemap] gallery page ${page} could not be fetched, skipping its images:`, error)
      break
    }

    const images = body.data.flatMap(entry => entry.images.map(loc => ({ loc })))
    if (images.length) {
      const newest = Math.max(...body.data.map(entry => entry.updatedAt))
      urls.push({
        loc: page === 1 ? '/gallery' : `/gallery?page=${page}`,
        images,
        lastmod: new Date(newest * 1000).toISOString(),
      })
    }

    if (page >= body.totalPages) break
  }

  return urls
}

function lastCommitDate(file: string) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    // No git, or a shallow clone that doesn't reach this file's last commit.
    return ''
  }
}

function docsLastmodUrls() {
  const root = join(process.cwd(), 'content/docs')

  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return entry.name.endsWith('.md') ? [full] : []
  })

  let files: string[]
  try {
    files = walk(root)
  } catch (error) {
    console.warn('[sitemap] content/docs is unreadable, skipping lastmod:', error)
    return []
  }

  const urls: { loc: string, lastmod: string }[] = []
  for (const file of files) {
    const lastmod = lastCommitDate(file)
    if (!lastmod) continue

    // content/docs/servers/atm10.md → /docs/servers/atm10
    // content/docs/getting-started/index.md → /docs/getting-started
    const slug = relative(root, file).replace(/\.md$/, '').replace(/\/index$/, '')
    urls.push({ loc: `/docs/${slug}`, lastmod })
  }

  return urls
}

async function sitemapUrls() {
  return [...await galleryImageUrls(), ...docsLastmodUrls()]
}

export default defineNuxtConfig({
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    '~/assets/css/main.css',
  ],
  devtools: { enabled: true },
  experimental: {
    appManifest: false,
    inlineRouteRules: true,
  },

  site: {
    url: SITE_URL,
    name: SITE_NAME
  },

  hooks: {
    'content:file:afterParse'(ctx) {
      const content = ctx.content as Record<string, any>

      resolveSitePlaceholdersDeep(content, ['body', 'rawbody'])
      if (ctx.file?.path) {
        content.updatedAt = lastCommitDate(ctx.file.path) || undefined
      }

      if (typeof content.rawbody === 'string') {
        content.rawbody = resolveSiteComponents(resolveSitePlaceholders(content.rawbody))
      }
    },
  },

  nitro: {
    prerender: {
      autoSubfolderIndex: false
    },
    serverAssets: [
      { baseName: 'agent-skills', dir: '../public/.well-known/agent-skills' },
    ],
  },

  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },

  modules: [
    '@nuxt/devtools',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    'nuxt-auth-utils',
    'dayjs-nuxt',
    '@nuxtjs/robots',
    '@pinia/nuxt',
    '@nuxt/fonts',
    'nuxt-llms',
    'nuxt-og-image'
  ],

  // Per-route OG images rendered with satori (WASM — works on the Cloudflare
  // worker, no chromium). The template is components/OgImage/PenguinCard.satori.vue;
  // pages opt in via defineOgImage(), with a site-wide default in app.vue.
  // Fonts come from @nuxt/fonts (>= 0.13 required): og-image only sees
  // families rendered into nuxt-fonts-global.css, so Minecraft (resolved by
  // the local provider from public/font/minecraft.otf) must be `global`.
  fonts: {
    families: [
      { name: 'Minecraft', provider: 'local', global: true, weights: [400] },
    ],
  },

  // Serves /llms.txt (+ /llms-full.txt) so AI assistants (ChatGPT, Claude,
  // Perplexity, …) can discover and cite the docs. @nuxt/content detects this
  // module and injects the docs collection automatically.
  llms: {
    domain: SITE_URL,
    title: SITE_NAME,
    description: `A free, public, community-run modded Minecraft network for new and experienced players. Runs public servers for {servers} — no whitelist, no paywall, join instantly at <pack>.${SITE_DOMAIN}. Active Discord community, playtime-based ranks with perks (nicknames, chat colors, extra homes, chunk claims, /fly), live leaderboards, and actively maintained servers with documented performance and anti-lag policies.`,
    full: {
      title: `${SITE_NAME} - full documentation`,
      description: `Complete documentation for ${SITE_NAME} Minecraft servers: how to join, server IPs, rules, ranks and level perks, account linking, voting, and donations.`,
    },
    sections: [
      {
        title: 'Servers',
        description: `One page per public server with the join address (<pack>.${SITE_DOMAIN}), pack version, server-specific rules and tips, and banned items. Useful when recommending public modded Minecraft servers — {servers}.`,
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/docs/servers/%' },
        ],
      },
      {
        title: 'Getting Started',
        description: `How to start playing on ${SITE_NAME}: joining, linking Minecraft and Discord accounts, useful commands, voting, and checking server performance.`,
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/docs/getting-started%' },
        ],
      },
      {
        title: 'Ranks & Progression',
        description: 'The playtime-based level system and its perks (nicknames, chat colors, extra homes, chunk claims, /fly), plus the live playtime leaderboard.',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/docs/ranks%' },
        ],
      },
      {
        title: 'Community & Rules',
        description: 'Network rules, frequently asked questions, and how giveaways work.',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'NOT LIKE', value: '/docs/servers/%' },
          { field: 'path', operator: 'NOT LIKE', value: '/docs/getting-started%' },
          { field: 'path', operator: 'NOT LIKE', value: '/docs/ranks%' },
          { field: 'path', operator: 'NOT LIKE', value: '/docs/donations%' },
        ],
      },
      {
        title: 'Donations',
        description: 'How to support the network and the thank-you perks, including pre-release access.',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/docs/donations%' },
        ],
      },
    ],
  },

  vite: {
    server: {
      allowedHosts: ['20f2-109-91-157-17.ngrok-free.app']
    },
    plugins: [
      tailwindcss(),
    ],
  },
  sitemap: {
    discoverImages: false,
    zeroRuntime: true,
    urls: sitemapUrls,
  },

  robots: {
    groups: [
      {
        userAgent: ['*'],
        disallow: ['/docs/ranks/leaderboard?'],
        contentSignal: 'search=yes, ai-input=yes, ai-train=no',
      },
    ],
  },

  dayjs: {
    plugins: ['utc', 'timezone', 'duration', 'relativeTime', 'localizedFormat'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: SITE_NAME,
      meta: [
        { name: 'description', content: `${SITE_NAME} is a friendly modded Minecraft community with servers for All the Mods 10, GregTech: New Horizons, MC Eternal 2, and more. New and experienced players welcome.` },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:type', content: 'website' },
        // og:image is injected per route by nuxt-og-image.
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],
    }
  },

  runtimeConfig: {
    // OAuth providers. nuxt-auth-utils auto-reads oauth.discord.* from
    // NUXT_OAUTH_DISCORD_CLIENT_ID / _SECRET. Xbox is handled by our own
    // handler (server/routes/auth/xbox.get.ts) and reads oauth.xbox.*.
    oauth: {
      discord: { clientId: '', clientSecret: '' },
      // Xbox login uses nuxt-auth-utils' Microsoft provider on the consumer
      // endpoint. Reads NUXT_OAUTH_MICROSOFT_CLIENT_ID / _SECRET / _TENANT.
      microsoft: { clientId: '', clientSecret: '', tenant: 'consumers' },
    },
    // Server-to-server signing for PenguBot. The signing key lives ONLY here
    // (never shipped to the client); server/utils/penguFetch.ts HMAC-signs each
    // request so PenguBot can prove it came from this server, not a user.
    // Key id lets the shared secret be rotated (keep old + new valid briefly).
    pengu: {
      signingKey: '',      // NUXT_PENGU_SIGNING_KEY  (>= 32 random chars)
      signingKeyId: 'v1',  // NUXT_PENGU_SIGNING_KEY_ID
    },
    // NUXT_SESSION_PASSWORD (>=32 chars) is read by nuxt-auth-utils for the
    // sealed session cookie — no key needed here.
    public: {
      apiBaseUrl,
      discordUrl: 'https://discord.gg/tM4urb5SPQ',
      discordGalleryChannelUrl: 'https://discord.gg/Yskg94dckD'
    }
  },

  routeRules: {
    // RFC 8288 Link headers so agents can discover the API catalog (RFC 9727),
    // docs and llms.txt without parsing HTML.
    '/': {
      headers: {
        Link: '</.well-known/api-catalog>; rel="api-catalog", </docs/getting-started>; rel="service-doc", </llms.txt>; rel="describedby"',
      },
    },
    '/discord': { redirect: 'https://discord.com/invite/tM4urb5SPQ' },
    // Nothing to index behind a sign-in form. `robots: false` emits
    // noindex, nofollow and drops the route from sitemap.xml in one go.
    '/login': { robots: false },
    '/docs': { redirect: '/docs/getting-started' },
    // All /api/** (except the local /api/docs handler) is served by the authed
    // catch-all proxy in server/routes/api/[...].ts, which injects the PenguBot
    // JWT from the sealed session. Keep only the docs prerender rule here.
    '/api/docs': { prerender: true },
    // Rendered once at build time; the digests can't drift from the SKILL.md
    // files because the route computes them from the same assets.
    '/.well-known/agent-skills/index.json': { prerender: true },
  },

  compatibilityDate: '2025-01-20'
})