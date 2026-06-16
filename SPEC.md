# SPEC — EnBizCard BASE_URL Subpath Support

## §G Goal

Deploy EnBizCard at configurable subpath (e.g. `example.com/bizcard`) via `BASE_URL` env var without breaking root-path deployment.

## §C Constraints

- Nuxt 2, `ssr:false`, `target:static`, output to `public/`
- `BASE_URL` baked at build time (static site, no runtime server)
- No trailing slash on `BASE_URL` (e.g. `/bizcard` not `/bizcard/`)
- `BASE_URL=''` (empty) = root deployment; must remain default
- `nuxt-link` / `to` props resolve via `router.base` automatically — do NOT manually prefix those
- Plain `href` in JS strings and `fetch()` calls do NOT inherit `router.base` — must prefix manually
- `pdfjs-dist` babel config must not be disturbed
- No new abstractions; each fix is a direct string substitution
- Upstream Caddy uses `handle /bizcard*` (NOT `handle_path`) → full path `/bizcard/...` forwarded to `10.10.10.149:8000`; LXC server must map `/bizcard` prefix to `public/` root

## §I Interfaces

- `.env` / `.env.example` — `BASE_URL=/subpath` (new file; user-created at deploy time)
- `nuxt.config.js` — exposes `BASE_URL` via `env:` block and `router.base`
- `components/Preview.vue` — consumes `process.env.BASE_URL` for `/logo.png` fallback + share href
- `pages/index.vue` — consumes `process.env.BASE_URL` for `fetch('/logo.png')` + `/demo` anchor

## §V Invariants

- V1: `router.base = process.env.BASE_URL || '/'` — all Vue router navigation and Nuxt JS chunk URLs resolve under subpath
- V2: `env: { BASE_URL: process.env.BASE_URL || '' }` in nuxt.config.js — `process.env.BASE_URL` evaluates to string in components at build time
- V3: Every hardcoded absolute asset path (`/logo.png`, `/favicon.ico`, icons, qrcode script, manifest icons, og:image, tile meta) is prefixed with `process.env.BASE_URL` (or `b` shortvar in nuxt.config.js)
- V4: `manifest.start_url` = `(process.env.BASE_URL || '') + '/'`
- V5: No `nuxt-link to=` or `<NuxtLink to=` values are manually prefixed (router.base handles them)
- V6: `BASE_URL` ends with no trailing slash at all usage sites — consumers do `BASE_URL + '/asset'` not `BASE_URL/ + asset`
- V7: Root deployment (`BASE_URL` unset or `''`) produces identical output to pre-change behavior
- V8: `BASE_URL=/bizcard` must match the prefix in the upstream Caddy `handle /bizcard*` block exactly (no trailing slash, same casing)
- V9: Node >=22; `NODE_OPTIONS` must include `--openssl-legacy-provider` in all Docker stages that run webpack (webpack 4 uses deprecated OpenSSL 1.x APIs removed in OpenSSL 3.x bundled with Node 18+)
- V10: `BASE_URL` passed as Docker `ARG` to builder stage (baked into `npm run generate` via `ENV BASE_URL`) and to nginx stage (used to generate `nginx.conf` at build time)
- V11: nginx.conf generated dynamically at Docker build time via `printf`; `location /bizcard { rewrite ^/bizcard/?(.*)$ /$1 break; ... }` strips prefix before serving `public/`; when `BASE_URL=''`, defaults to `location /` (root deployment parity)
- V12: Nuxt 4 target version `4.4.8`; migrate via `npx codemod@0.18.7 nuxt/4/migration-recipe` then fix residuals manually
- V13: Nuxt 4 `app.baseURL` (set via `NUXT_APP_BASE_URL` env var) replaces custom `BASE_URL` + `router.base` + `env:` block — all `process.env.BASE_URL` refs in components → `useRuntimeConfig().app.baseURL`
- V14: `buildModules` removed in Nuxt 4; all modules in single `modules` array; `@nuxtjs/pwa` → `@vite-pwa/nuxt`; `@aceforth/nuxt-optimized-images` → `@nuxt/image`; `@nuxtjs/tailwindcss` stays (v6+ for Nuxt 4)
- V15: pdfjs-dist handled via `vite.optimizeDeps.exclude` in nuxt.config; raw-loader and babel-loader workarounds removed (Vite replaces webpack 4)
- V16: No `--openssl-legacy-provider` in Nuxt 4 (Vite); Dockerfiles use `node:22-alpine`, drop openssl flag from `NODE_OPTIONS`
- V17: `NUXT_APP_BASE_URL=/bizcard` env var (Nuxt 4 convention) replaces `BASE_URL`; nginx subpath logic unchanged; `.env.example` updated
- V18: Vue 2-only packages replaced: `vue-clickaway2` → `@vueuse/core` `onClickOutside`; `vuedraggable` → `vuedraggable@^4.x` (Vue 3); `@caohenghu/vue-colorpicker` → Vue 3-compatible alternative

## §T Tasks

| id | status | task | cites |
|----|--------|------|-------|
| T1 | x | Create `.env.example` with `BASE_URL=` commented doc | §I |
| T2 | x | `nuxt.config.js`: add `env: { BASE_URL }` + `router: { base }` block | V1,V2 |
| T3 | x | `nuxt.config.js`: prefix all `head.link` hrefs (5 favicon/icon links) | V3,V6 |
| T4 | x | `nuxt.config.js`: prefix `head.script[0].src` (`/qrcode.min.js`) | V3,V6 |
| T5 | x | `nuxt.config.js`: prefix `meta.ogImage` + `head.meta` tile content values | V3,V6 |
| T6 | x | `nuxt.config.js`: prefix `manifest.start_url` and all 14 `manifest.icons[].src` | V4,V6 |
| T7 | x | `components/Preview.vue:427`: replace `'/logo.png'` with `process.env.BASE_URL + '/logo.png'` | V3,V6 |
| T8 | x | `components/Preview.vue:490`: replace `href="/demo"` in share string with `href="${process.env.BASE_URL}/demo"` | V3,V6 |
| T9 | x | `pages/index.vue:2179`: replace `fetch('/logo.png')` with `fetch(process.env.BASE_URL + '/logo.png')` | V3,V6 |
| T10 | x | `pages/index.vue:163`: replace `href="/demo"` anchor with `href="${process.env.BASE_URL}/demo"` or bind dynamically | V3,V5,V6 |
| T11 | x | Manual verify: `npm run generate` with `BASE_URL=/bizcard` — check `public/` _nuxt chunk paths, favicon hrefs, manifest, logo fetch | V1,V3,V7 |
| T12 | x | `package.json`: update `engines` to `>=22` | V9 |
| T13 | x | `Dockerfile`: `node:22-alpine`, add `--openssl-legacy-provider` to `NODE_OPTIONS`, add `ARG BASE_URL` + `ENV BASE_URL` to builder stage, generate nginx.conf dynamically via `printf` in nginx stage | V9,V10,V11 |
| T14 | x | `Dockerfile.dev`: `node:22-alpine`, add `ENV NODE_OPTIONS=--openssl-legacy-provider`, add `ARG BASE_URL` + `ENV BASE_URL`, add `--legacy-peer-deps` to npm install | V9,V10 |
| T15 | x | `docker-compose.yml`: pass `BASE_URL` as `build.args` to prod+dev services; default prod port to `8000` to match Caddy `reverse_proxy 10.10.10.149:8000`; pass `BASE_URL` in dev `environment` | V10,V8 |
| T16 | x | Run codemod: `npx codemod@0.18.7 nuxt/4/migration-recipe` — auto-migrates config, pages, components | V12 |
| T17 | x | `package.json`: `nuxt→^4.4.8`, replace `@nuxtjs/pwa`→`@vite-pwa/nuxt`, `@aceforth/nuxt-optimized-images`→`@nuxt/image`, `@nuxtjs/tailwindcss→^6.x`, `vuedraggable→^4.x`, remove `core-js`/`raw-loader`/`sass-loader`, engines `>=18` | V14,V18 |
| T18 | x | `nuxt.config.ts`: `defineNuxtConfig`, `app.baseURL: process.env.NUXT_APP_BASE_URL\|\|'/'`, remove `router.base`+`env:BASE_URL`, move `head→app.head`, `buildModules→modules`, configure `@vite-pwa/nuxt` for manifest+icons, `vite.optimizeDeps.exclude: ['pdfjs-dist']` | V13,V14,V15,V17 |
| T19 | x | Remove manual `process.env.BASE_URL` prefixes added in T7-T10 from `nuxt.config.ts` head/manifest (Nuxt 4 handles via `app.baseURL`); replace `process.env.BASE_URL` in `Preview.vue`+`pages/index.vue` with `useRuntimeConfig().app.baseURL` | V13,V17 |
| T20 | x | Dockerfiles: drop `--openssl-legacy-provider` from `NODE_OPTIONS`, rename `ARG/ENV BASE_URL` → `NUXT_APP_BASE_URL`; update `.env.example` | V16,V17 |
| T21 | x | Fix Vue 2-only packages post-codemod: `vue-clickaway2` → `@vueuse/core` `onClickOutside`; verify `vuedraggable@^4.x` API; verify `@caohenghu/vue-colorpicker` Vue 3 compat | V18 |
| T22 | ~ | `npm run generate` verify with `NUXT_APP_BASE_URL=/bizcard` — check output dir, chunk paths, manifest, nginx config still valid | V12,V13,V17 |

## §B Bugs

| id | date | cause | fix |
|----|------|-------|-----|
| B1 | 2026-06-16 | `require(\`...svg?include\`)` webpack raw-loader syntax not valid in Vite | Replaced with Nuxt plugin using `import.meta.glob('../assets/icons/*.svg', {query:'?raw'})` + global `$icon()` method |
| B2 | 2026-06-16 | `!!raw-loader!...` for CSS/JS in index.vue webpack-only | Theme CSS: `?raw` Vite import; qrcode.min.js: fetch at runtime from public/ |
| B3 | 2026-06-16 | `vuex` not in dependencies; `mapState`/`mapActions` not available in Nuxt 4 | Replaced with `useState('theme')` composable `useTheme()` |
| B4 | 2026-06-16 | `static/` dir Nuxt 2 → `public/` in Nuxt 4 | Renamed `static/` → `public/`; updated Dockerfile to `COPY .output/public` |
| B5 | 2026-06-16 | pdfjs-dist local at `assets/scripts/pdfjs-dist` has no `build/` dir; `main` in package.json wrong | Use `lib/pdf.js` direct import; remove worker import (disabled anyway) |
| B6 | 2026-06-16 | `<Nuxt>` removed in Nuxt 4; use `<NuxtPage>` | Replaced in `layouts/default.vue` |
| B7 | 2026-06-16 | CSS `url('~static/...')` not valid in Vite; `~` is webpack alias only | Font refs changed to absolute `/nunito.woff2` (file now in `public/`) |
| B8 | 2026-06-16 | Vue 2 transition classes `.x-enter` → `.x-enter-from` in Vue 3 | Fixed in `layouts/default.vue` and `Colour.vue` |
| B9 | 2026-06-16 | `@click.native` removed in Vue 3 | Removed `.native` from Modal binding in `index.vue` |
| B10 | 2026-06-16 | `mixins/utils.js` at project root; `@/mixins/utils` resolves to `app/` in Nuxt 4 | Moved to `app/mixins/utils.js`; `getSVG` updated to use `this.$icon()` |
