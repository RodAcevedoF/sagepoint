#!/bin/bash
set -euo pipefail
export PATH="/usr/local/bin:/usr/bin:/bin"

COMPOSE_FILE="/opt/sagepoint/docker-compose.prod.yml"
SCALE_UP_THRESHOLD=10
SCALE_DOWN_THRESHOLD=2
REDIS_DB="${REDIS_DB:-0}"

REDIS_CLI="docker exec shared_redis redis-cli -n $REDIS_DB"

DOCS_WAITING=$($REDIS_CLI llen "bull:document-processing:wait" 2>/dev/null || echo 0)
ROADMAP_WAITING=$($REDIS_CLI llen "bull:roadmap-generation:wait" 2>/dev/null || echo 0)
[[ "$DOCS_WAITING" =~ ^[0-9]+$ ]] || DOCS_WAITING=0
[[ "$ROADMAP_WAITING" =~ ^[0-9]+$ ]] || ROADMAP_WAITING=0
TOTAL=$((DOCS_WAITING + ROADMAP_WAITING))

WORKER2_RUNNING=$(docker ps --filter "name=sagepoint_worker_2" --filter "status=running" --format "{{.Names}}" | wc -l)

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [autoscale] $*"; }

log "Queue depth — docs:$DOCS_WAITING roadmap:$ROADMAP_WAITING total:$TOTAL worker-2:$WORKER2_RUNNING"

if [ "$TOTAL" -gt "$SCALE_UP_THRESHOLD" ] && [ "$WORKER2_RUNNING" -eq 0 ]; then
    log "Scaling UP worker-2 (total=$TOTAL > threshold=$SCALE_UP_THRESHOLD)"
    docker compose -f "$COMPOSE_FILE" --profile scale up -d worker-2

elif [ "$TOTAL" -le "$SCALE_DOWN_THRESHOLD" ] && [ "$WORKER2_RUNNING" -gt 0 ]; then
    log "Scaling DOWN worker-2 (total=$TOTAL <= threshold=$SCALE_DOWN_THRESHOLD)"
    docker compose -f "$COMPOSE_FILE" stop worker-2
fi
