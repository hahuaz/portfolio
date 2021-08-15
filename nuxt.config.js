export default {
  target: 'static',
  ssr: true,
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Hahuaz - Web Developer',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Junior web developer located at İstanbul - Turkey.',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/ha.ico' }],
    script: [],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/main.css', '~/assets/css/main.scss'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [{ src: '~/plugins/vue-typer.js', ssr: false }],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/fontawesome',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',

    'vue-scrollto/nuxt',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  fontawesome: {
    icons: {
      solid: ['faPaperPlane', 'faExternalLinkAlt'],
      regular: true,
      // light: [ ... ],
      // duotone: [ ... ],
      brands: true,
    },
  },
  publicRuntimeConfig: {
    strapiURL:
      process.env.NODE === 'deployement'
        ? process.env.STRAPI_URL
        : 'http://localhost:1337',
  },
  privateRuntimeConfig: {},
}
