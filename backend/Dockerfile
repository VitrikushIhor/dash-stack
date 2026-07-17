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

# Copy root package and lockfile
COPY --from=builder /app/package.json /app/package-lock.json ./

# Copy root node_modules (which contains the generated Prisma client and all hoisted deps)
COPY --from=builder /app/node_modules ./node_modules

# Copy backend workspace package and files
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/tsconfig.json ./backend/

# Prune dev dependencies from the root workspace
RUN npm prune --production

# Use non-root user
USER node

# We run from the backend workspace
WORKDIR /app/backend

EXPOSE 8000
CMD [ "npm", "run", "start:prod" ]