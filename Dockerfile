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

# nginx:alpine's /docker-entrypoint.d/20-envsubst-on-templates.sh renders this into
# /etc/nginx/conf.d/default.conf at container start, substituting $BASE. It only
# substitutes names present in the environment, so nginx's own $uri is left alone.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
