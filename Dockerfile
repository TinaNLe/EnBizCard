# ──────────────────────────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

ARG NUXT_APP_BASE_URL=
ENV NUXT_APP_BASE_URL=${NUXT_APP_BASE_URL}

COPY package.json ./
RUN npm install

COPY . .
RUN npm run generate

# ──────────────────────────────────────────────────────────────
# Stage 2: Runtime (nginx)
# ──────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

ARG NUXT_APP_BASE_URL=
ENV BASE=${NUXT_APP_BASE_URL}

# Copy the bundle to the subpath itself. nginx then stays a plain static root
# server — no alias, no per-base location branching.
COPY --from=build /app/.output/public /usr/share/nginx/html/${NUXT_APP_BASE_URL}

# nginx:alpine ships its own index.html at the html root. Under a subpath deploy the
# bundle lands beside it, so `GET /` resolves the directory index and serves the nginx
# welcome page instead of the app. Drop it.
RUN rm -f /usr/share/nginx/html/index.html /usr/share/nginx/html/50x.html

# Send bare `/` to the subpath: the SPA boots Vue Router with base ${BASE}/ and will not
# match `/`, so serving index.html there lands on the SPA's own 404. Empty file for root
# deploys, where `return 301 /` would loop forever. Cannot live in the template —
# envsubst has no conditionals.
RUN if [ -n "${NUXT_APP_BASE_URL#/}" ]; then \
      printf 'location = / { return 301 %s/; }\n' "${NUXT_APP_BASE_URL%/}" \
        > /etc/nginx/root-redirect.conf; \
    else \
      : > /etc/nginx/root-redirect.conf; \
    fi

# nginx:alpine's /docker-entrypoint.d/20-envsubst-on-templates.sh renders this into
# /etc/nginx/conf.d/default.conf at container start, substituting $BASE. It only
# substitutes names present in the environment, so nginx's own $uri is left alone.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
