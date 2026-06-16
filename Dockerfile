FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG NUXT_APP_BASE_URL=""
ENV NUXT_APP_BASE_URL=${NUXT_APP_BASE_URL}
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV NUXT_DEVTOOLS_ENABLED=false
RUN npm run generate

FROM nginx:1.27-alpine
COPY --from=builder /app/.output/public /usr/share/nginx/html
ARG NUXT_APP_BASE_URL=""
RUN SUBPATH="${NUXT_APP_BASE_URL:-/}"; \
    printf 'server {\n    listen 80;\n    root /usr/share/nginx/html;\n    index index.html;\n\n    location %s {\n        rewrite ^%s/?(.*)$ /$1 break;\n        try_files $uri $uri/ /index.html;\n    }\n}\n' \
    "$SUBPATH" "$SUBPATH" > /etc/nginx/conf.d/default.conf

EXPOSE 80
