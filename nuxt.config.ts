// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  experimental: { appManifest: false },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
      '@nuxt/devtools',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    'dayjs-nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],

  vite: {
    server: {
      allowedHosts: ['e0ba-109-91-157-17.ngrok-free.app']
    }
  },

  dayjs: {
    plugins: ['utc', 'timezone', 'duration'],
  },

  app: {
    head: {
      title: 'ihatemy.live',
      meta: [
        { name: 'description', content: 'the BEST minecraft Network there is' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],
    }
  },

  runtimeConfig: {
    discordClientId: '',
    public: {
      discordUrl: 'https://discord.gg/tM4urb5SPQ' 
    }
  },
  routeRules: {
    '/auth/discord/callback': { ssr: false },
    '/docs': { redirect: '/docs/getting-started' },
    '/api/playtime': { proxy: 'https://penguin-bot.ihatemy.live/playtime' },
    '/api/player-profile': { proxy: 'https://penguin-bot.ihatemy.live/player-profile' },
    '/api/nick': { proxy: 'https://penguin-bot.ihatemy.live/nick' },
    '/api/public-uuids': { proxy: 'https://penguin-bot.ihatemy.live/public-uuids' },
    '/api/servers': { proxy: 'https://penguin-bot.ihatemy.live/servers' },
    '/api/leaderboard': { proxy: 'https://penguin-bot.ihatemy.live/leaderboard' },
    '/api/auth/discord': { proxy: 'https://penguin-bot.ihatemy.live/auth/discord' },
    '/api/user/**': { proxy: 'https://penguin-bot.ihatemy.live/user/**' },
    '/api/mini-message/preview': { proxy: 'https://penguin-bot.ihatemy.live/mini-message/preview' },
  },

  compatibilityDate: '2025-01-20'
})