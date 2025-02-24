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

  modules: ['@nuxt/devtools', '@nuxtjs/sitemap', '@nuxt/content', 'dayjs-nuxt'],

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
      script: [{ hid: "stripe", src: "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js", defer: true }],
    }
  },

  runtimeConfig: {
    public: {
      discordUrl: 'https://discord.gg/tM4urb5SPQ' 
    }
  },
  routeRules: {
    '/api/playtime': { proxy: 'https://penguin-bot.ihatemy.live/playtime' },
    '/api/leaderboard': { proxy: 'https://penguin-bot.ihatemy.live/leaderboard' },
  },

  compatibilityDate: '2025-01-20'
})