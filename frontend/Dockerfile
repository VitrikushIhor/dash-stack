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

# Configure nginx for non-root operation
RUN rm /etc/nginx/conf.d/default.conf && \
    printf 'server {\n\
    listen 8080;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Use non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
