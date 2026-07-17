FROM node:22-alpine AS builder

# Create app directory
WORKDIR /app

# Copy root workspace files for deterministic installs
COPY package.json package-lock.json ./

# Copy backend package.json for workspace resolution
COPY backend/package.json ./backend/

# Copy prisma schema
COPY backend/prisma ./backend/prisma/

# Install dependencies (workspace-aware)
RUN npm ci --workspace=backend --include-workspace-root

# Copy backend source code
COPY backend/ ./backend/

# Build application
RUN npm run build --workspace=backend

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

# Prune dev dependencies to reduce image size
RUN npm prune --production

EXPOSE 8000
CMD [ "npm", "run", "start:prod" ]