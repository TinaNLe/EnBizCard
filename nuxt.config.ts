// Nuxt copies app.baseURL into runtimeConfig.app.baseURL verbatim — it never adds or
// strips a trailing slash. Normalize once here so every consumer can concatenate:
// '' -> '/', '/bizcard' -> '/bizcard/', '/bizcard/' -> '/bizcard/'
const base = `/${process.env.NUXT_APP_BASE_URL || ''}/`.replace(/\/+/g, '/')

const pwaIcons = [64, 120, 144, 152, 192, 384, 512].flatMap((size) => [
  { src: `${base}icon_${size}.png`, sizes: `${size}x${size}`, type: 'image/png' },
  { src: `${base}maskable_${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'maskable' },
])

export default defineNuxtConfig({
  ssr: false,

  app: {
    baseURL: base,
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
          content: base + 'mstile-150x150.png',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: base + 'favicon.ico?v=2' },
        { rel: 'icon', type: 'image/png', href: base + 'favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', href: base + 'favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: base + 'apple-touch-icon.png' },
        { rel: 'mask-icon', color: '#111827', href: base + 'safari-pinned-tab.svg' },
      ],
      script: [{ src: base + 'qrcode.min.js' }],
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
          start_url: base,
          scope: base,
          theme_color: '#111827',
          background_color: '#111827',
          icons: pwaIcons,
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