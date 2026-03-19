#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="/opt/sagepoint"

cd "$DEPLOY_DIR"

echo "Pulling latest images..."
docker compose -f docker-compose.prod.yml pull

echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T api node node_modules/.bin/prisma migrate deploy

echo "Deployment complete."
docker compose -f docker-compose.prod.yml ps
