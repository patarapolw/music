import { NuxtConfig } from '@nuxt/types'
import serveStatic from 'serve-static'

export default async (): Promise<NuxtConfig> => {
  return {
    // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
    ssr: false,

    router: {
      mode: 'hash',
    },

    // Global page headers (https://go.nuxtjs.dev/config-head)
    head: {
      title: 'Music Browser',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },

    // Global CSS (https://go.nuxtjs.dev/config-css)
    css: [],

    // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
    plugins: [],

    // Auto import components (https://go.nuxtjs.dev/config-components)
    components: true,

    // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
    buildModules: [
      // https://go.nuxtjs.dev/typescript
      '@nuxt/typescript-build',
    ],

    // Modules (https://go.nuxtjs.dev/config-modules)
    modules: [
      // https://go.nuxtjs.dev/buefy
      'nuxt-buefy',
    ],

    // Build Configuration (https://go.nuxtjs.dev/config-build)
    build: {},
    serverMiddleware: [
      { path: '/api', handler: '~/server/index.ts' },
      {
        path: '/_data/music-sheets',
        handler: serveStatic(
          '/home/patarapolw/projects/music-browser/_data/music-sheets'
        ),
      },
    ],
  }
}
