// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
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
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  sitemap: {
    discoverImages: false,
    zeroRuntime: true
  },

  modules: ['@nuxt/devtools', '@nuxtjs/sitemap', '@nuxtjs/robots', '@nuxt/content', 'dayjs-nuxt', 'nitro-cloudflare-dev'],

  dayjs: {
    plugins: ['utc', 'timezone', 'duration', 'relativeTime', 'localizedFormat'],
  },

  app: {
    head: {
      title: 'The Penguin Network',
      meta: [
        { name: 'description', content: 'the BEST minecraft Network there is' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],
    }
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://penguin-bot.ihatemy.live',
      discordUrl: 'https://discord.gg/tM4urb5SPQ' 
    }
  },

  routeRules: {
    '/docs': { redirect: {to: '/docs/getting-started', statusCode: 308} },
    '/discord': { redirect: 'https://discord.com/invite/tM4urb5SPQ' },
    '/api/docs': {prerender: true},
    '/api/all-servers': {redirect: 'https://penguin-bot.ihatemy.live/all-servers'}
  },

  compatibilityDate: '2025-01-20'
})