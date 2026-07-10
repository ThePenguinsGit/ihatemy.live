// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

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
    url: 'https://ihatemy.live',
    name: 'The Penguin Network'
  },

  nitro: {
    prerender: {
      autoSubfolderIndex: false
    }
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
    'nuxt-studio',
    'nuxt-auth-utils',
    'dayjs-nuxt',
    '@nuxtjs/robots',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/fonts',
    'nuxt-tiptap-editor',
    'nuxt-llms'
  ],

  // Serves /llms.txt (+ /llms-full.txt) so AI assistants (ChatGPT, Claude,
  // Perplexity, …) can discover and cite the docs. @nuxt/content detects this
  // module and injects the docs collection automatically.
  llms: {
    domain: 'https://ihatemy.live',
    title: 'The Penguin Network',
    description: 'A friendly modded Minecraft community running servers for All the Mods 10, ATM10: To the Sky, GregTech: New Horizons, MC Eternal 2, Prominence 2, StoneBlock 4, and Society: Sunlit Valley.',
    full: {
      title: 'The Penguin Network — full documentation',
      description: 'Complete documentation for The Penguin Network Minecraft servers: how to join, server IPs, rules, ranks and level perks, account linking, voting, and donations.',
    },
  },

  // Self-hosted Nuxt Studio — web-based editing of content/ for non-devs, no
  // local git needed. Editor mounts at /_studio (SSR server routes) and commits
  // to the repo via the GitHub API.
  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'ThePenguinsGit',
      repo: 'ihatemy.live',
      branch: 'master',
      private: true,
    },
    // Auth: custom OIDC/SSO provider (production Authentik). The module reads
    // STUDIO_SSO_URL / STUDIO_SSO_CLIENT_ID / STUDIO_SSO_CLIENT_SECRET (and
    // STUDIO_SSO_REDIRECT_URL) from env and enables SSO login when present.
    // OIDC authenticates the person only, so commits are authorized by a
    // service PAT in STUDIO_GITHUB_TOKEN. Dummy placeholders live in .env /
    // .env.example now; production overrides them with real Authentik values.
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
    zeroRuntime: true
  },

  dayjs: {
    plugins: ['utc', 'timezone', 'duration', 'relativeTime', 'localizedFormat'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'The Penguin Network',
      meta: [
        { name: 'description', content: 'The PenguinNetwork is a friendly modded Minecraft community with servers for All the Mods 10, GregTech: New Horizons, MC Eternal 2, and more. New and experienced players welcome.' },
        { property: 'og:site_name', content: 'The PenguinNetwork' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://ihatemy.live/logo_big.png' },
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
      apiBaseUrl: 'https://penguin-bot.ihatemy.live',
      discordUrl: 'https://discord.gg/tM4urb5SPQ'
    }
  },

  routeRules: {
    '/discord': { redirect: 'https://discord.com/invite/tM4urb5SPQ' },
    '/docs': { redirect: '/docs/getting-started' },
    // All /api/** (except the local /api/docs handler) is served by the authed
    // catch-all proxy in server/routes/api/[...].ts, which injects the PenguBot
    // JWT from the sealed session. Keep only the docs prerender rule here.
    '/api/docs': { prerender: true },
  },

  compatibilityDate: '2025-01-20'
})