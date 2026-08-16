#!/bin/sh
set -e

# Start backend container and database in development mode
echo "🚀 Starting Dash Stack Backend development environment..."
docker compose -f docker-compose.dev.yml up --build "$@"