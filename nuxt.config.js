const pkg = require('./package')
import path from 'path'
module.exports = {
  mode: 'universal',

  watch: ['@@/content/**', '@@/modules/**'],

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/tailwind.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    '@/modules/blogger',
    '@/modules/nuxt-content'
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    baseURL: 'http://localhost:3000/',
    browserBaseURL: 'http://localhost:3000/'
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */

  build: {
    /*
    ** You can extend webpack config here
    */
   extend (config, { isDev, isClient }) {

    config.module.rules.push({
      test: /\.md$/,
      loader: 'frontmatter-markdown-loader',
      include: path.resolve(__dirname, 'content'),
      options: {
        vue: {
          root: "dynamicMarkdown"
        }
      }
    });
    }
  }
}
