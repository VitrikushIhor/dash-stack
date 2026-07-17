# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace files for npm ci
COPY package.json package-lock.json ./

# Copy frontend package.json for workspace resolution
COPY frontend/package.json ./frontend/

# Install dependencies (workspace-aware)
RUN npm ci --workspace=frontend --include-workspace-root

# Copy frontend source code
COPY frontend/ ./frontend/

# Build application
RUN npm run build --workspace=frontend

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration (optional)
# COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
