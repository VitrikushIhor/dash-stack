FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

# Copy root workspace files for deterministic installs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy backend package.json for workspace resolution
COPY backend/package.json ./backend/

# Copy prisma schema
COPY backend/prisma ./backend/prisma/

# Install dependencies (workspace-aware)
RUN pnpm install --frozen-lockfile --filter backend...

# Copy backend source code
COPY backend/ ./backend/

# Build application
RUN pnpm --filter backend run build

# Deploy isolated backend workspace with production dependencies
RUN pnpm --filter backend --prod deploy /app/pruned

FROM base AS runner
WORKDIR /app/backend

# Copy production artifacts and isolated node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/pruned/node_modules ./node_modules
COPY --from=builder /app/pruned/package.json ./package.json

# Use non-root user
USER node

EXPOSE 8000
CMD [ "node", "dist/main" ]