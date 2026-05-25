# syntax=docker/dockerfile:1.7

FROM node:24-alpine
RUN corepack enable
WORKDIR /repo

# Install workspace deps first so the layer can be cached when sources change.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy the sources used by apps/api at runtime.
COPY apps/api ./apps/api
COPY packages/db ./packages/db

ENV NODE_ENV=production
WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["pnpm", "exec", "tsx", "src/server.ts"]
