# Pinle — production image
# Çalıştırma: docker build -t pinle . && docker run -p 3000:3000 -v pinle-data:/app/data pinle
# ÖNEMLİ: /app/data kalıcı volume olmalı (SQLite veritabanı + yüklenen fotoğraflar orada).

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# devDependencies (tailwind/postcss, tsc) build için gerekli — NODE_ENV=production
# enjekte edilse bile atlanmasın diye --include=dev.
RUN npm ci --include=dev

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd -r pinle && useradd -r -g pinle pinle \
  && mkdir -p /app/data && chown pinle:pinle /app/data

COPY --from=builder --chown=pinle:pinle /app/.next/standalone ./
COPY --from=builder --chown=pinle:pinle /app/.next/static ./.next/static
COPY --from=builder --chown=pinle:pinle /app/public ./public
COPY --from=builder --chown=pinle:pinle /app/scripts ./scripts

USER pinle
VOLUME /app/data
EXPOSE 3000
CMD ["node", "server.js"]
