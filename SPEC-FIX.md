# SPEC-FIX: `baseURL` Defects

Status: **implemented and verified** (2026-07-09). Contract: Option A (trailing slash).
Scope: subpath deployment via `NUXT_APP_BASE_URL` (e.g. `https://example.com/bizcard`).

D3 and D4 below were superseded during implementation — the `.config` copy dance and the
`printf` nginx generator were deleted outright rather than repaired. See "As built".

Root deployment (`NUXT_APP_BASE_URL` unset) works today. Every defect below appears only when a subpath is configured, except **F4**, which breaks both.

---

## Root cause

Nuxt copies `app.baseURL` into `runtimeConfig.app.baseURL` **verbatim**. It does not add or strip a trailing slash. From `packages/schema/src/config/common.ts`:

```ts
runtimeConfig: {
  $resolve: async (_val, get) => {
    ...
    return defu(val, {
      public: {},
      app: { buildId, baseURL: app.baseURL, buildAssetsDir: app.buildAssetsDir, cdnURL: app.cdnURL },
    })
  },
}
```

The Nuxt docs consistently use a **trailing slash** (`app: { baseURL: '/prefix/' }`, `router.base: '/my-app/'`).

This repo has no single convention. Two halves of the codebase assume opposite formats:

| Site | Assumes | Example with `NUXT_APP_BASE_URL=/bizcard` |
|---|---|---|
| `nuxt.config.ts` head links (`base + '/favicon.ico'`) | **no** trailing slash | `/bizcard/favicon.ico` ✅ |
| `app/pages/index.vue` (`` `${baseURL}demo` ``) | **has** trailing slash | `/bizcarddemo` ❌ |

Both cannot hold at once. `.env.example` mandates *"No trailing slash"*, and `.env` currently reads `NUXT_APP_BASE_URL=/bizcard` — so the runtime half is the half that is broken.

---

## Findings

### F1 — Runtime `baseURL` concatenation produces malformed URLs — **critical**

`app.baseURL` is `/bizcard` (no trailing slash). Three call sites concatenate directly:

| File:line | Expression | Produces |
|---|---|---|
| `app/pages/index.vue:87` | `` :href="`${baseURL}demo`" `` | `/bizcarddemo` |
| `app/pages/index.vue:828` | `` fetch(`${baseURL}.config`) `` | `/bizcard.config` |
| `app/components/Preview.vue:359` | `` href="${baseURL}demo" `` | `/bizcarddemo` |

The `.config` fetch failure is **silent** — `.catch(() => null)` swallows the 404, so custom colors and the photo config are dropped with no error. The user sees defaults and no indication anything went wrong.

Correct only when `NUXT_APP_BASE_URL` is empty (`baseURL === '/'`).

### F2 — Head links assume the opposite convention — **high**

`nuxt.config.ts:24,28–32,34` build `base + '/favicon.ico?v=2'`, `base + '/qrcode.min.js'`, etc. Correct for `/bizcard`; emits a double slash (`/bizcard//favicon.ico`) the moment anyone follows the Nuxt docs and writes `/bizcard/`.

This is why F1 cannot be fixed by simply appending a slash to `.env` — that fix breaks F2. Both must move to one normalized helper.

### F3 — PWA manifest icons ignore `baseURL` — **high**

`nuxt.config.ts:52–65` hardcode absolute icon paths (`/icon_64.png`, `/maskable_64.png`, …). Confirmed in the committed build output, `.output/public/manifest.webmanifest`:

```json
{"start_url":"/bizcard","scope":"/bizcard","icons":[{"src":"/icon_64.png", ...}]}
```

`@vite-pwa/nuxt` derives `start_url` and `scope` from `baseURL` but leaves `icons[].src` untouched. Under a subpath every icon 404s and the install prompt degrades. `start_url` / `scope` also inherit the missing trailing slash from F1.

### F4 — Static assets live in the wrong directory — **high** (breaks root deployment too)

Nuxt 4 serves the public directory from `<rootDir>/public`. This repo keeps its 31 static assets in `static/` — the Nuxt 2 convention — and `public/` **does not exist**. Worse, `.gitignore:73` ignores `public` under the heading `# Nuxt generate`, a leftover from when `public` was an *output* directory:

```gitignore
# Nuxt generate
dist
public
```

On a fresh clone, `favicon.ico`, `qrcode.min.js` (the QR code feature), `/demo`, and every PWA icon 404 regardless of `baseURL`. Prefixing a path that resolves to nothing does not help.

> `.output/public/` still contains these files, but it is stale build residue — `favicon.ico` is dated 2026-06-11, predating the current `nuxt.config.ts`. It is not evidence the current tree builds correctly.

### F5 — Docker build fails whenever `.config` is present — **medium**

`Dockerfile:17` and `docker-entrypoint.sh:12` copy into a directory that does not exist:

```dockerfile
RUN if [ -f .config ]; then cp .config public/.config && rm .config; fi
```

`cp: can't create 'public/.config': No such file or directory` → non-zero exit → build aborts. This only stays green today because `.config` is gitignored and therefore absent from the build context. But `docker-compose.yml:13` bind-mounts `./.config` and the README instructs users to create it — so the documented workflow is the failing one.

### F6 — nginx SPA fallback drops the base path — **medium**

`Dockerfile:54–61`, subpath branch:

```nginx
location /bizcard/ {
    alias /usr/share/nginx/html/;
    try_files $uri $uri/ /index.html;
}
location / { return 301 /bizcard/; }
```

The final `try_files` argument is a **URI**, not a file path. It re-enters location matching, hits `location /`, and returns `301 /bizcard/`. Any unknown deep link under the subpath bounces the user to the home page instead of serving the SPA shell or `404.html`. Fallback must be base-qualified: `try_files $uri $uri/ /bizcard/index.html;`.

### F7 — Two contradictory env templates — **low**

Both files exist and disagree:

- `.env.example:1` — `# No trailing slash. Leave empty for root deployment (default).`
- `env.example:2-3` — `# Use / for root deployment` / `# Use /bizcard for subpath`

### F8 — `SPEC.md` documents an API the code does not use — **low**

`SPEC.md:220` states components read the base via `useRuntimeConfig().public.baseURL`, and `SPEC.md:215` shows a `runtimeConfig: { public: { baseURL } }` block. Neither exists. The code uses `useRuntimeConfig().app.baseURL`.

### F9 — `${NUXT_APP_BASE_URL%/}` strips only one trailing slash — **low**

`Dockerfile:33`. Input `/bizcard//` yields `/bizcard/`, producing `location /bizcard// {`. Edge case; normalization (D1) removes it.

---

## Decision required

Two coherent contracts exist. **They are mutually exclusive and must be chosen before any fix lands.**

**Option A — canonical trailing slash (recommended).** `app.baseURL` is always `/…/` or `/`.

- Matches the Nuxt documentation.
- The three runtime call sites (F1) need **zero** changes — `` `${baseURL}demo` `` is already correct.
- Only `nuxt.config.ts` changes; `Dockerfile`'s `%/` strip already tolerates both inputs.

**Option B — no trailing slash.** `app.baseURL` is `/bizcard` or `''`.

- Matches the current `.env.example` wording.
- Requires editing all three runtime call sites to use `joinURL`, and the root case becomes `''` vs `'/'`, which is ambiguous for `fetch`.

**This spec assumes Option A.** Confirm before implementing.

---

## Fix plan (Option A)

Normalize once, in one place. No `ufo` import — a regex is enough and adds no dependency.

### D1 — Normalize `base` in `nuxt.config.ts`

```ts
// Always leading + trailing slash, duplicate slashes collapsed.
// ''        -> '/'
// '/bizcard'  -> '/bizcard/'
// '/bizcard/' -> '/bizcard/'
const base = `/${process.env.NUXT_APP_BASE_URL || ''}/`.replace(/\/+/g, '/')
```

Then:

- `app.baseURL: base`
- head links: `base + 'favicon.ico?v=2'` (drop the leading `/` from each literal) — lines 24, 28–32, 34
- PWA icons: `base + 'icon_64.png'`, … — lines 52–65
- PWA manifest: add explicit `start_url: base` and `scope: base`

**Verify:** build with `NUXT_APP_BASE_URL` unset, `/bizcard`, and `/bizcard/`. In all three, `.output/public/index.html` and `manifest.webmanifest` contain no `//` and no unprefixed asset path.

### D2 — Move static assets to `public/`

1. `git mv static public`
2. Delete the `public` line from `.gitignore:73` (keep `dist`).
3. Confirm nothing else references `static/`.

**Verify:** `ls .output/public/qrcode.min.js .output/public/demo/index.html` succeeds after a clean `npm run generate` in a fresh clone.

> `static/` also shadows a second copy of `pdfjs-dist` (the CodeGraph index shows 472 vendored JS files across `assets/` and `app/assets/`). Root-level `assets/`, `components/`, `pages/`, `store/`, `mixins/`, `layouts/` all appear to be Nuxt 2 orphans superseded by `app/`. **Out of scope — do not delete as part of this fix.** Flagging only.

### ~~D3 — Fix the `.config` copy path~~ → superseded: delete the workaround

`.config` collided with c12's `.config/` directory convention, and the repo carried 43 lines of
shell to dodge the resulting `ENOTDIR`. Renaming the file removes the collision, so all of it goes:

- `.config` → `public/config.json` (Nuxt dev and nginx both serve `public/` as-is)
- delete `docker-entrypoint.sh` (19 lines) and its `ENTRYPOINT`/`COPY`/`chmod` in `Dockerfile.dev`
- delete `server/plugins/sync-config.ts` (24 lines) — existed only to copy `.config` into `public/`
- delete `Dockerfile:15-17`
- `app/pages/index.vue:828` → `` fetch(`${baseURL}config.json`) ``
- compose mounts: `./public/config.json:/usr/share/nginx/html${NUXT_APP_BASE_URL:-}/config.json:ro`

**Verify:** `GET ${BASE}/config.json` → 200, body parses as JSON.

### ~~D4 — Base-qualify the nginx fallback~~ → superseded: delete the generator

The 30-line `printf` block generated two hand-branched nginx configs. Instead, copy the bundle
*into* the subpath so nginx is a plain static root server — no `alias`, no branching:

```dockerfile
COPY --from=build /app/.output/public /usr/share/nginx/html/${NUXT_APP_BASE_URL}
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BASE=${NUXT_APP_BASE_URL}
```

`nginx:alpine`'s built-in `/docker-entrypoint.d/20-envsubst-on-templates.sh` renders the template at
container start. It only substitutes names present in the environment, so nginx's own `$uri` is
untouched. One config serves both root and subpath.

**Verify:** `curl -o /dev/null -w '%{http_code} %{num_redirects}' localhost:8000/bizcard/no-such-page`
→ `200 0`, and the body contains `/bizcard/_nuxt/`.

### D5 — Collapse the env templates

Delete `env.example`. Keep `.env.example`, reworded for Option A:

```
# Subpath for the app. Leave empty for root deployment (default).
# Trailing slash optional — it is normalized at build time.
# Must be set at BUILD time; it is baked into the static bundle.
NUXT_APP_BASE_URL=
```

**Verify:** `ls env.example` fails; `grep -c NUXT_APP_BASE_URL .env.example` returns 1.

### D6 — Correct `SPEC.md`

Update `SPEC.md:215,220` to `useRuntimeConfig().app.baseURL` and remove the phantom `runtimeConfig.public.baseURL` block. State the trailing-slash contract explicitly.

**Verify:** `grep -n 'public.baseURL' SPEC.md` returns nothing.

---

## As built

| Change | Files |
|---|---|
| Normalize `base`, prefix head links + PWA icons, add `start_url`/`scope` | `nuxt.config.ts` |
| `static/` → `public/`, un-ignore `public`, ignore `.output` | 49 renames, `.gitignore` |
| `.config` → `public/config.json`; workaround deleted | `Dockerfile`, `Dockerfile.dev`, `docker-compose.yml`, `app/pages/index.vue`, −`docker-entrypoint.sh`, −`server/plugins/sync-config.ts` |
| `printf` nginx generator → envsubst template | `Dockerfile`, +`nginx.conf.template` |
| Single env template | −`env.example`, `.env.example`, `README.md` |
| Docs match reality | `SPEC.md` |

Net: **−43 lines of shell**, two files deleted, PWA icon list 14 lines → 4.

## Success criteria — all verified

Served the real `nuxt generate` output through the real `nginx.conf.template`:

| # | Check | Result |
|---|---|---|
| 1 | `npm run generate`, base `''` and `/bizcard` → no `//` in `index.html` / `manifest.webmanifest` | pass |
| 2 | `nginx -t` on rendered template, `BASE=''` and `BASE=/bizcard` | pass |
| 3 | `GET /bizcard/` | 200 |
| 4 | `GET /bizcard/{favicon.ico, qrcode.min.js, icon_64.png, manifest.webmanifest}` | 200 |
| 5 | `GET /bizcard/config.json` → JSON body parses | 200 |
| 6 | `GET /bizcard/demo/` (the **View demo** link) | 200 |
| 7 | `GET /bizcard/no-such-page` → SPA shell, 0 redirects | 200 |
| 8 | `GET /bizcard/hosting-guide/` | 200 |
| 9 | Root deploy: `GET /`, `/favicon.ico`, `/no-such-page` | 200 |

Criteria 4–7 all failed before this change. Criterion 5 failed *silently* — `.catch(() => null)`
swallowed the 404 — which is why it went unnoticed.

`docker compose build` was not run to completion: Docker Desktop OOMs while Vite transforms the
vendored `pdfjs-dist` (`rpc error: code = Unavailable`). Unrelated to this change, but it means the
production image has not been built end-to-end on this machine.

## Still open (not in scope)

- Root-level `assets/`, `components/`, `pages/`, `store/`, `mixins/`, `layouts/` are Nuxt 2 orphans
  superseded by `app/`. `pages/index.vue:2191` still fetches `/.config`. Dead, but not deleted.
- `pdfjs-dist` is vendored twice (`assets/` and `app/assets/`), ~472 JS files. It is what OOMs the
  Docker build and what makes CodeGraph queries useless on this repo.
- `docker-compose.yml` bind-mounts `./public/config.json`; if the file is absent Docker creates a
  *directory* in its place. Pre-existing footgun, unchanged.
