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
    '@nuxt/image',
    '@nuxt/devtools',
    '@nuxt/content',
    'dayjs-nuxt',
  ],

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
  },

  image: {
    ipx: {}
  },

  compatibilityDate: '2025-01-20'
})