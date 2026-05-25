# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /repo/packages/db/node_modules ./packages/db/node_modules
COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/db ./packages/db

WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["pnpm", "exec", "tsx", "src/server.ts"]
