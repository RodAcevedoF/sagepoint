#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# VPS Migration Script — Consolidate Postgres + Redis into shared infra
#
# Run this on the VPS as: bash migrate-vps.sh
# It will pause at each step so you can verify before continuing.
# =============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

pause() {
  echo ""
  echo -e "${YELLOW}>>> $1${NC}"
  echo -e "Press Enter to continue, or Ctrl+C to abort..."
  read -r
}

info() {
  echo -e "${GREEN}[OK]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
  exit 1
}

# ─── Pre-flight checks ───────────────────────────────────────────────────────

echo "============================================"
echo "  VPS Migration: Shared Infrastructure"
echo "============================================"
echo ""

# Check docker is available
command -v docker >/dev/null 2>&1 || error "docker not found"
command -v docker compose >/dev/null 2>&1 || error "docker compose not found"
info "Docker available"

# Check existing containers are running
if docker ps --format '{{.Names}}' | grep -q "postgres_db"; then
  info "todo-api postgres container found (postgres_db)"
else
  echo -e "${YELLOW}[WARN]${NC} postgres_db container not running — skipping data migration"
fi

if docker ps --format '{{.Names}}' | grep -q "redis"; then
  info "chefify redis container found"
fi

# ─── Step 1: Create directory structure ───────────────────────────────────────

pause "Step 1: Create /opt directory structure for all services"

sudo mkdir -p /opt/infra
sudo mkdir -p /opt/todo-api
sudo mkdir -p /opt/chefify
sudo mkdir -p /opt/sagepoint
sudo chown -R "$USER:$USER" /opt/infra /opt/todo-api /opt/chefify /opt/sagepoint

info "Directories created under /opt/"

# ─── Step 2: Back up existing Postgres data ───────────────────────────────────

pause "Step 2: Back up todo-api Postgres data"

BACKUP_DIR="/opt/infra/backups"
mkdir -p "$BACKUP_DIR"

if docker ps --format '{{.Names}}' | grep -q "postgres_db"; then
  echo "Dumping todo-api database..."
  docker exec postgres_db pg_dumpall -U "$(docker exec postgres_db printenv POSTGRES_USER)" \
    > "$BACKUP_DIR/todo_db_backup.sql"
  info "Backup saved to $BACKUP_DIR/todo_db_backup.sql"
  echo "Backup size: $(du -h "$BACKUP_DIR/todo_db_backup.sql" | cut -f1)"
else
  echo "Skipping — postgres_db not running"
fi

# ─── Step 3: Set up infra .env ────────────────────────────────────────────────

pause "Step 3: Configure shared Postgres credentials"

if [ ! -f /opt/infra/.env ]; then
  echo "Creating /opt/infra/.env..."
  echo "Choose a password for the shared Postgres superuser."
  echo -n "POSTGRES_PASSWORD: "
  read -r PG_PASS
  cat > /opt/infra/.env <<EOF
POSTGRES_USER=admin
POSTGRES_PASSWORD=$PG_PASS
EOF
  info "Created /opt/infra/.env"
else
  info "/opt/infra/.env already exists, skipping"
fi

# ─── Step 4: Copy infra compose files ─────────────────────────────────────────

pause "Step 4: Copy infra docker-compose and init SQL"

# These files should already be on the VPS (scp'd or git pulled)
# If running from the repo:
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/infra/docker-compose.yml" ]; then
  cp "$SCRIPT_DIR/infra/docker-compose.yml" /opt/infra/docker-compose.yml
  cp "$SCRIPT_DIR/infra/init-databases.sql" /opt/infra/init-databases.sql
  info "Copied infra compose files"
else
  echo -e "${YELLOW}[WARN]${NC} Infra compose files not found next to this script."
  echo "Copy them manually to /opt/infra/ before continuing."
  pause "Confirm files are in /opt/infra/"
fi

# ─── Step 5: Start shared infrastructure ──────────────────────────────────────

pause "Step 5: Start shared Postgres + Redis"

cd /opt/infra
docker compose up -d

echo "Waiting for Postgres to be ready..."
for i in $(seq 1 30); do
  if docker exec shared_postgres pg_isready -U admin >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker exec shared_postgres pg_isready -U admin >/dev/null 2>&1 || error "Postgres failed to start"
info "Shared Postgres is ready"

docker exec shared_redis redis-cli ping >/dev/null 2>&1 || error "Redis failed to start"
info "Shared Redis is ready"

# Verify databases were created
echo "Checking databases..."
docker exec shared_postgres psql -U admin -l | grep -E "todo_db|sagepoint"
info "Databases created"

# ─── Step 6: Restore todo-api data ───────────────────────────────────────────

pause "Step 6: Restore todo-api data into shared Postgres"

if [ -f "$BACKUP_DIR/todo_db_backup.sql" ]; then
  echo "Restoring backup..."
  # The pg_dumpall includes role creation — we restore selectively into todo_db
  docker exec -i shared_postgres psql -U admin -d todo_db \
    < "$BACKUP_DIR/todo_db_backup.sql" 2>&1 | tail -5
  info "Data restored (check output above for any warnings)"
else
  echo "No backup file found — skipping restore"
fi

# ─── Step 7: Stop old containers ─────────────────────────────────────────────

pause "Step 7: Stop old todo-api and chefify containers (old Postgres + Redis)"

echo "Current containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
echo ""

if [ -f ~/todo-api/docker-compose.yml ]; then
  echo "Stopping todo-api stack..."
  cd ~/todo-api && docker compose down
  info "todo-api stack stopped"
fi

if [ -f ~/chefify/docker-compose.yml ]; then
  echo "Stopping chefify stack..."
  cd ~/chefify && docker compose down
  info "chefify stack stopped"
fi

# ─── Step 8: Set up todo-api with shared infra ───────────────────────────────

pause "Step 8: Set up todo-api to use shared Postgres"

# Copy the source code
if [ -d ~/todo-api/todo_api ]; then
  cp -r ~/todo-api/todo_api /opt/todo-api/todo_api
  info "Copied todo_api source"
fi

if [ -f "$SCRIPT_DIR/todo-api/docker-compose.yml" ]; then
  cp "$SCRIPT_DIR/todo-api/docker-compose.yml" /opt/todo-api/docker-compose.yml
  info "Copied todo-api compose file"
fi

# Create .env for todo-api
PG_PASS=$(grep POSTGRES_PASSWORD /opt/infra/.env | cut -d= -f2)
if [ ! -f /opt/todo-api/.env ]; then
  cat > /opt/todo-api/.env <<EOF
DB_USER=admin
DB_PASSWORD=$PG_PASS
DB_NAME=todo_db
EOF
  info "Created /opt/todo-api/.env"
fi

cd /opt/todo-api
docker compose up -d
info "todo-api started with shared Postgres"

# ─── Step 9: Set up chefify with shared infra ────────────────────────────────

pause "Step 9: Set up chefify to use shared Redis"

if [ -d ~/chefify/chefify-api ]; then
  cp -r ~/chefify/chefify-api /opt/chefify/chefify-api
  info "Copied chefify-api source"
fi

if [ -f "$SCRIPT_DIR/chefify/docker-compose.yml" ]; then
  cp "$SCRIPT_DIR/chefify/docker-compose.yml" /opt/chefify/docker-compose.yml
  info "Copied chefify compose file"
fi

echo ""
echo -e "${YELLOW}NOTE:${NC} Check chefify-api/.env — if it references redis://localhost,"
echo "update it to redis://shared_redis:6379"
echo ""
pause "Confirm chefify .env is correct"

cd /opt/chefify
docker compose up -d
info "chefify started with shared Redis"

# ─── Step 10: Verify everything ──────────────────────────────────────────────

pause "Step 10: Final verification"

echo ""
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Network connections:"
docker network inspect shared --format '{{range .Containers}}  - {{.Name}}{{"\n"}}{{end}}'

echo ""
echo "Testing services..."

# Test Postgres
docker exec shared_postgres psql -U admin -c "SELECT 'postgres: OK'" -t 2>/dev/null && info "Postgres OK"

# Test Redis
docker exec shared_redis redis-cli ping 2>/dev/null && info "Redis OK"

# Test todo-api
curl -sf http://127.0.0.1:4000/ >/dev/null 2>&1 && info "todo-api OK" || echo -e "${YELLOW}[WARN]${NC} todo-api not responding on :4000 (check logs: docker logs todo_api)"

# Test chefify
curl -sf http://127.0.0.1:4001/ >/dev/null 2>&1 && info "chefify OK" || echo -e "${YELLOW}[WARN]${NC} chefify not responding on :4001 (check logs: docker logs chefify_api)"

echo ""
echo "============================================"
echo "  Migration complete!"
echo "============================================"
echo ""
echo "Next steps for Sagepoint:"
echo "  1. Copy docker-compose.prod.yml + .env.production to /opt/sagepoint/"
echo "  2. Set up nginx: sudo cp deploy/nginx/sagepoint.conf /etc/nginx/sites-available/"
echo "     sudo ln -s /etc/nginx/sites-available/sagepoint.conf /etc/nginx/sites-enabled/"
echo "     sudo certbot --nginx -d api.yourdomain.com"
echo "  3. Add GitHub secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY)"
echo "  4. Push to master — CI will build images, SSH deploy to VPS"
echo ""
