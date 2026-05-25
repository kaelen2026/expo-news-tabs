# syntax=docker/dockerfile:1.7

# ── build stage ─────────────────────────────────────────────────────────
# Installs every workspace dep, compiles apps/api with tsc, and fails the
# image build when types don't check.
FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY apps/api ./apps/api
COPY packages/db ./packages/db

RUN pnpm --filter api build

# ── runtime stage ───────────────────────────────────────────────────────
# Re-resolves prod-only deps so typescript/vitest/etc. don't ship, then
# copies the compiled dist plus the db workspace source (db re-exports
# from .ts; tsx's ESM loader handles that and the extensionless relative
# imports tsc leaves behind).
FROM node:24-alpine AS runtime
RUN corepack enable
WORKDIR /repo
ENV NODE_ENV=production

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts --prod

COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY packages/db ./packages/db

WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["node", "--import", "tsx/esm", "dist/server.js"]
