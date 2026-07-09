# ──────────────────────────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

ARG NUXT_APP_BASE_URL=/
ENV NUXT_APP_BASE_URL=${NUXT_APP_BASE_URL}

COPY package.json ./
RUN npm install

COPY . .
# Move .config out of root before generate so Nitro's c12 scanner doesn't hit ENOTDIR.
# It lands in public/ which gets copied into .output/public/ and served at /.config.
RUN if [ -f .config ]; then cp .config public/.config && rm .config; fi
RUN npm run generate

# ──────────────────────────────────────────────────────────────
# Stage 2: Runtime (nginx)
# ──────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

ARG NUXT_APP_BASE_URL=/

COPY --from=build /app/.output/public /usr/share/nginx/html

# Write the nginx config inline using printf '%s\n' with individual
# single-quoted strings — single quotes prevent $uri from being
# expanded by the shell, so nginx receives the literal variable name.
# Lines that need the base path use double-quoted strings with $BASE.
RUN BASE="${NUXT_APP_BASE_URL%/}" && \
    if [ -z "$BASE" ]; then \
      printf '%s\n' \
        'server {' \
        '    listen 80;' \
        '    server_name _;' \
        '    sendfile off;' \
        '    absolute_redirect off;' \
        '    root /usr/share/nginx/html;' \
        '    location / {' \
        '        try_files $uri $uri/ /index.html;' \
        '    }' \
        '}' \
        > /etc/nginx/conf.d/default.conf; \
    else \
      printf '%s\n' \
        'server {' \
        '    listen 80;' \
        '    server_name _;' \
        '    sendfile off;' \
        '    absolute_redirect off;' \
        "    location ${BASE}/ {" \
        '        alias /usr/share/nginx/html/;' \
        '        try_files $uri $uri/ /index.html;' \
        '    }' \
        "    location = ${BASE} { return 301 ${BASE}/; }" \
        '    location / {' \
        "        return 301 ${BASE}/;" \
        '    }' \
        '}' \
        > /etc/nginx/conf.d/default.conf; \
    fi && \
    echo '--- generated nginx config ---' && \
    cat /etc/nginx/conf.d/default.conf && \
    nginx -t

EXPOSE 80
