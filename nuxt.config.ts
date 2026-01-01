// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  experimental: {
    appManifest: false,
    inlineRouteRules: true,
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: ['@nuxt/devtools', '@nuxtjs/sitemap', '@nuxt/content', 'dayjs-nuxt', '@nuxtjs/robots'],

  vite: {
    server: {
      allowedHosts: ['e0ba-109-91-157-17.ngrok-free.app']
    }
  },

  dayjs: {
    plugins: ['utc', 'timezone', 'duration', 'relativeTime'],
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
      script: [{ src: "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js", defer: true }],
    }
  },

  runtimeConfig: {
    public: {
      discordUrl: 'https://discord.gg/tM4urb5SPQ' 
    }
  },
  routeRules: {
    '/docs': { redirect: '/docs/getting-started' },
    '/api/playtime': { proxy: 'https://penguin-bot.ihatemy.live/playtime' },
    '/api/servers': { proxy: 'https://penguin-bot.ihatemy.live/servers' },
    '/api/all-servers': { proxy: 'https://penguin-bot.ihatemy.live/all-servers' },
    '/api/leaderboard': { proxy: 'https://penguin-bot.ihatemy.live/leaderboard' },
    '/api/vote-leaderboard': { proxy: 'https://penguin-bot.ihatemy.live/vote-leaderboard' },
  },

  compatibilityDate: '2025-01-20'
})