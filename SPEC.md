# EnBizCard — Architecture & Migration Specification

## Overview

EnBizCard is an open-source digital business card generator. Users fill in a form, preview their card live, then download a self-contained ZIP package (HTML + CSS + media files) they can host anywhere.

The editor runs entirely in the browser — no server-side rendering, no backend, no accounts required.

---

## Architecture

### Tech Stack (post-migration)

| Layer | Technology |
|---|---|
| Framework | Nuxt 4.4.8 |
| Vue | Vue 3.5+ |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v3 (via @nuxtjs/tailwindcss) |
| State | `useState` composables (no Vuex/Pinia) |
| PWA | @vite-pwa/nuxt |
| Images | @nuxt/image |
| Drag-drop | vuedraggable v4 |
| Image crop | cropperjs |
| ZIP gen | jszip |
| File save | file-saver |
| ID3 tags | id3-parser |
| PDF preview | pdfjs-dist (local copy in assets) |
| Click-outside | @vueuse/core onClickOutside |

### Directory Structure

```
EnBizCard/
├── app/                         # Nuxt 4 source root (srcDir)
│   ├── app.vue                  # App entry — <NuxtLayout><NuxtPage/>
│   ├── assets/
│   │   ├── css/tailwind.css     # Tailwind directives
│   │   ├── icons/               # 82 SVG icons (loaded as raw strings)
│   │   ├── scripts/
│   │   │   ├── pdfjs-dist/      # Local PDF.js library (CJS)
│   │   │   └── qrcode.min.js    # QR code library (raw import for ZIP)
│   │   └── styles/
│   │       ├── T1.min.css       # Business card theme 1
│   │       ├── T2.min.css       # Business card theme 2
│   │       └── T3.min.css       # Business card theme 3
│   ├── components/              # 16 Vue 3 components
│   ├── composables/
│   │   ├── useIcons.ts          # SVG glob loader + getSVG helper
│   │   └── useTheme.ts          # Theme state (useState)
│   ├── layouts/
│   │   └── default.vue          # Root layout (fonts, global styles)
│   └── pages/
│       ├── index.vue            # Main card builder (2400+ lines)
│       └── hosting-guide/
│           └── index.vue        # Static hosting instructions
├── public/                      # Static files served as-is
│   ├── fonts/                   # Nunito woff2 files
│   ├── favicon*.png / .ico
│   ├── icon_*.png / maskable_*.png   # PWA icons
│   ├── apple-touch-icon.png
│   └── demo/                    # Demo business card
├── nuxt.config.ts
├── tailwind.config.js
├── package.json
├── Dockerfile                   # Production: node:22-alpine → nginx:alpine
├── Dockerfile.dev               # Development: node:22-alpine
├── docker-compose.yml
├── .dockerignore
├── nginx.conf.template         # Rendered by nginx's envsubst at container start
└── .env.example
```

---

## Migration Summary (Nuxt 2 → Nuxt 4)

### Framework

| Before | After |
|---|---|
| nuxt ^2.15.8 | nuxt 4.4.8 |
| Vue 2 | Vue 3.5+ |
| Webpack | Vite 7 |
| Options API | Composition API (`<script setup>`) |
| Vuex store | `useState` composable |
| Mixins | Composable functions |
| `static/` | `public/` |
| `nuxt.config.js` | `nuxt.config.ts` |
| `<Nuxt/>` | `<NuxtPage/>` |
| `beforeDestroy` | `onBeforeUnmount` |

### Package Changes

**Removed:**
- `@caohenghu/vue-colorpicker` → replaced with `<input type="color">` (native)
- `vue-clickaway2` → replaced with `@vueuse/core` onClickOutside
- `vuedraggable ^2.x` → upgraded to `vuedraggable ^4.x` (Vue 3 compatible)
- `@nuxtjs/pwa` → replaced with `@vite-pwa/nuxt`
- `@aceforth/nuxt-optimized-images` → replaced with `@nuxt/image`
- `raw-loader` → Vite's native `?raw` query
- `sass-loader` → not needed with Vite
- `cross-env` → not needed

**Added:**
- `@vueuse/core` (click-outside, other utilities)
- `@vite-pwa/nuxt`
- `@nuxt/image`
- `esbuild@0.28.1` (pinned)
- `vite@^7` (pinned)

### SVG Icon System

Previously, SVG icons were loaded at runtime using webpack's raw-loader:
```js
// Nuxt 2 (webpack)
require('~/assets/icons/logo.svg?include')
```

Now they are eagerly loaded at build time using `import.meta.glob`:
```ts
// Nuxt 4 (Vite) — in app/composables/useIcons.ts
const svgModules = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw', import: 'default', eager: true
})
```

Components call `getIcon(name)` instead. Gradient icon IDs are randomised per-instance by `getSVG(item)` to prevent SVG gradient conflicts.

### Raw Imports

| Before | After |
|---|---|
| `import X from '!!raw-loader!~/path/to/file'` | `import X from '~/path/to/file?raw'` |

Theme CSS files and qrcode.min.js are imported as raw strings so they can be embedded directly in the downloaded ZIP package.

### Transition Class Names

Vue 3 renamed the initial transition class:
- `.foo-enter` → `.foo-enter-from`
- `.foo-leave-to` → (unchanged)

All transitions in `default.vue` were updated accordingly.

### Draggable (v2 → v4)

The `vuedraggable` v4 API uses slot-based rendering instead of wrapping children:

```html
<!-- v2 -->
<draggable v-model="list">
  <transition-group name="list">
    <Item v-for="item in list" :key="item.name" />
  </transition-group>
</draggable>

<!-- v4 -->
<draggable v-model="list" item-key="name" tag="transition-group" :component-data="{ name: 'list' }">
  <template #item="{ element, index }">
    <Item :item="element" :index="index" />
  </template>
</draggable>
```

### Color Picker

`@caohenghu/vue-colorpicker` was replaced with the browser-native `<input type="color">`. The color swatch now acts as a label wrapping a visually hidden color input — same UX, zero dependencies.

### Action State Management

The original Vuex store only tracked theme (1, 2, 3). This was replaced with a minimal composable:

```ts
// app/composables/useTheme.ts
const theme = useState<number>('theme', () => 1)
export function useTheme() {
  function changeTheme(value: number) { theme.value = value }
  return { theme, changeTheme }
}
```

The action pools (primary/secondary) are managed with `reactive()` arrays inside `index.vue` rather than in a global store, since they're only needed by the single main page.

---

## Configurable Base Path

### How It Works

The base URL is controlled by the `NUXT_APP_BASE_URL` environment variable. It must be set **at build time** because Nuxt bakes asset URLs into the static HTML at generation time.

```ts
// nuxt.config.ts
// Nuxt copies app.baseURL into runtimeConfig.app.baseURL verbatim — it never adds or
// strips a trailing slash. Normalize once so every consumer can concatenate.
const base = `/${process.env.NUXT_APP_BASE_URL || ''}/`.replace(/\/+/g, '/')

app: {
  baseURL: base,
}
```

**Contract: `app.baseURL` always carries a leading *and* trailing slash.** `''` → `/`, `/bizcard` → `/bizcard/`. Callers append directly — `` `${baseURL}demo` ``, `base + 'favicon.ico'` — and never insert their own slash.

Nuxt automatically prefixes all `_nuxt/` chunk URLs, `<NuxtLink>` hrefs, and CSS asset references with the configured base URL.

### Example Deployments

| `NUXT_APP_BASE_URL` | App accessible at |
|---|---|
| `/` | `https://example.com/` |
| `/bizcard` | `https://example.com/bizcard` |
| `/company/cards` | `https://example.com/company/cards` |

### Runtime Config

Nuxt mirrors `app.baseURL` into the runtime config automatically. No `runtimeConfig` block is needed.

```ts
const { app: { baseURL } } = useRuntimeConfig()
```

Components read the base URL via `useRuntimeConfig().app.baseURL`. Because of the contract above it always ends in `/`, so `` `${baseURL}config.json` `` is correct.

---

## Docker Build Flow

### Production (`Dockerfile`)

```
node:22-alpine (build stage)
  npm install
  npm run generate  ← Nuxt SSG with NUXT_APP_BASE_URL baked in
  → .output/public/

nginx:alpine (runtime stage)
  Copy .output/public/ → /usr/share/nginx/html/${NUXT_APP_BASE_URL}
  Copy nginx.conf.template → /etc/nginx/templates/
  ↳ nginx's own entrypoint renders it with envsubst at container start
  Expose port 80
```

### Nginx Configuration

The bundle is copied *into* the subpath at image build time:

```dockerfile
COPY --from=build /app/.output/public /usr/share/nginx/html/${NUXT_APP_BASE_URL}
```

So `/bizcard/_nuxt/main.js` maps to `/usr/share/nginx/html/bizcard/_nuxt/main.js` under a plain `root`. No `alias`, and one config for every deployment.

`nginx.conf.template` is rendered at *container start* by nginx:alpine's built-in `/docker-entrypoint.d/20-envsubst-on-templates.sh`, which substitutes `$BASE` and leaves nginx's own `$uri` alone (it only substitutes names present in the environment):

```nginx
server {
    listen 80;
    server_name _;
    sendfile off;
    absolute_redirect off;
    root /usr/share/nginx/html;
    location / {
        try_files $uri $uri/ ${BASE}/index.html;
    }
}
```

`BASE=""` yields the fallback `/index.html`; `BASE=/bizcard` yields `/bizcard/index.html`. The SPA fallback must be base-qualified — a bare `/index.html` would re-enter location matching and bounce deep links to the site root.

### Development (`Dockerfile.dev`)

```
node:22-alpine
  npm install
  nuxt dev --host 0.0.0.0 --port 3000
  NUXT_DEVTOOLS_ENABLED=false
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NUXT_APP_BASE_URL` | `/` | Base path for the app. Must be set at build time. |
| `ENBIZCARD_PORT` | `8000` | Host port mapped to the nginx container's port 80. |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Start dev server under a subpath
NUXT_APP_BASE_URL=/bizcard npm run dev

# Build production bundle
npm run generate

# Preview production bundle
npm run preview
```

### With Docker (development)

```bash
docker build -f Dockerfile.dev -t enbizcard-dev .
docker run -p 3000:3000 -v $(pwd):/app enbizcard-dev
```

---

## Production Deployment

### Root path

```bash
docker compose up -d
# App at http://localhost:8000
```

### Subpath (`/bizcard`)

```bash
NUXT_APP_BASE_URL=/bizcard ENBIZCARD_PORT=8000 docker compose up -d --build
# App at http://localhost:8000/bizcard
```

### Manual build + nginx

```bash
NUXT_APP_BASE_URL=/bizcard npm run generate
# Serve .output/public/ with nginx alias for /bizcard/
```

---

## Behavioral Differences from Original

1. **Color picker**: The HSB/wheel color picker (`@caohenghu/vue-colorpicker`) is replaced with the browser's native `<input type="color">`. Functionality is equivalent; appearance depends on the OS.

2. **Action pool state**: Previously tracked in Vuex, now tracked in reactive arrays local to `index.vue`. Behavior is identical.

3. **SVG icons**: Previously injected at runtime by webpack's raw-loader. Now compiled into the bundle by Vite's glob import. Initial page load may be slightly larger (all icons bundled) but no runtime filesystem access.

4. **Build output directory**: Previously `public/` (nuxt generate output). Now `.output/public/` (Nuxt 4 default). The `public/` directory is now the *source* static files directory.

5. **Dev server port**: Previously `PORT=2221`. Now standard Nuxt 4 dev port `3000`. Change with `--port` flag.

6. **`nuxt.config.js` → `nuxt.config.ts`**: Now TypeScript. `buildDir` override removed (not needed in Nuxt 4 since the temp directory is inside `.nuxt/`).

7. **PWA**: `@nuxtjs/pwa` replaced with `@vite-pwa/nuxt`. Service worker registration and manifest generation behaviour is equivalent.

8. **Image optimization**: `@aceforth/nuxt-optimized-images` replaced with `@nuxt/image`. The `<NuxtImg>` component is available for optimized images in components.

9. **pdfjs-dist**: Previously loaded from local `assets/scripts/pdfjs-dist` via CommonJS `require()`. Now loaded asynchronously with `await import()` in `onMounted`, keeping the bundle smaller and avoiding SSR issues. CJS→ESM conversion handled by Vite's `commonjsOptions`.
