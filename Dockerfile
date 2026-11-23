# One image for app, migrate and the Vitest run (AD-1, AD-24); the e2e stage adds Playwright.
FROM node:26.13.1-bookworm-slim AS base
# Full Perl (not only perl-base) for ExifTool through exiftool-vendored.
RUN apt-get update \
  && apt-get install -y --no-install-recommends perl \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /app /var/lib/crm-dam/files \
  && chown node:node /app /var/lib/crm-dam/files
WORKDIR /app
USER node

FROM base AS deps
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS app
COPY --chown=node:node . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]

FROM mcr.microsoft.com/playwright:v1.65.0-noble AS e2e
WORKDIR /e2e
COPY --from=deps /app/node_modules ./node_modules
COPY package.json playwright.config.ts ./
COPY tests/e2e ./tests/e2e
# The named seed users and sample-image fixture (pure data) that the e2e tests use.
COPY src/db/seed/fixture.ts ./src/db/seed/fixture.ts
CMD ["npx", "playwright", "test"]
