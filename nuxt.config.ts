// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    '@nuxt/image',
    '@nuxt/devtools',
  ],

  app: {
    head: {
      title: 'ihatemy.live',
      meta: [
        { name: 'description', content: 'the BEST minecraft Network there is' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ]
    }
  },

  runtimeConfig: {
    public: {
      discordUrl: 'https://discord.gg/tM4urb5SPQ' 
    }
  },

  image: {
    ipx: {}
  },

  compatibilityDate: '2025-01-20'
})