const base = process.env.NUXT_APP_BASE_URL || ''

export default defineNuxtConfig({
  ssr: false,

  app: {
    baseURL: base || '/',
    head: {
      title: 'EnBizCard - An Open-Source Digital Business Card Generator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'EnBizCard helps you create beautiful, responsive HTML-based digital business cards that can be hosted on your website.',
        },
        {
          name: 'msapplication-TileColor',
          content: '#111827',
        },
        {
          name: 'msapplication-TileImage',
          content: base + '/mstile-150x150.png',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: base + '/favicon.ico?v=2' },
        { rel: 'icon', type: 'image/png', href: base + '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', href: base + '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: base + '/apple-touch-icon.png' },
        { rel: 'mask-icon', color: '#111827', href: base + '/safari-pinned-tab.svg' },
      ],
      script: [{ src: base + '/qrcode.min.js' }],
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        manifest: {
          name: 'EnBizCard - An Open-Source Digital Business Card Generator',
          short_name: 'EnBizCard',
          display: 'standalone',
          theme_color: '#111827',
          background_color: '#111827',
          icons: [
            { src: '/icon_64.png', sizes: '64x64', type: 'image/png' },
            { src: '/maskable_64.png', sizes: '64x64', type: 'image/png', purpose: 'maskable' },
            { src: '/icon_120.png', sizes: '120x120', type: 'image/png' },
            { src: '/maskable_120.png', sizes: '120x120', type: 'image/png', purpose: 'maskable' },
            { src: '/icon_144.png', sizes: '144x144', type: 'image/png' },
            { src: '/maskable_144.png', sizes: '144x144', type: 'image/png', purpose: 'maskable' },
            { src: '/icon_152.png', sizes: '152x152', type: 'image/png' },
            { src: '/maskable_152.png', sizes: '152x152', type: 'image/png', purpose: 'maskable' },
            { src: '/icon_192.png', sizes: '192x192', type: 'image/png' },
            { src: '/maskable_192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icon_384.png', sizes: '384x384', type: 'image/png' },
            { src: '/maskable_384.png', sizes: '384x384', type: 'image/png', purpose: 'maskable' },
            { src: '/icon_512.png', sizes: '512x512', type: 'image/png' },
            { src: '/maskable_512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      },
    ],
  ],

  vite: {
    optimizeDeps: {
      exclude: ['pdfjs-dist'],
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/, /pdfjs-dist/],
      },
    },
  },

  telemetry: false,
})