FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_API_URL=https://api.saillant.cc
ENV VITE_API_URL=$VITE_API_URL
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-lock.yaml* ./
COPY finefab-ui/ ./finefab-ui/
RUN sed -i 's|file:../finefab-ui|file:./finefab-ui|' package.json && pnpm install --no-frozen-lockfile
COPY . .
RUN sed -i 's|../finefab-ui/src|./finefab-ui/src|g' tailwind.config.ts tailwind.config.js 2>/dev/null; pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:80/health || exit 1
