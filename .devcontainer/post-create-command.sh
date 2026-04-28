#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
echo

# Fix permissions for named volumes mounted under /workspace.
# These mount points can be created as root on first boot.
for dir in \
  /workspace/.turbo \
  /workspace/.cache/playwright \
  /workspace/node_modules \
  /workspace/apps/api/node_modules \
  /workspace/apps/web/.next \
  /workspace/apps/web/node_modules \
  /workspace/packages/db/node_modules \
  /workspace/packages/ui/node_modules \
  /workspace/docs/manual/node_modules \
  /workspace/docs/specs/node_modules; do
  sudo mkdir -p "$dir"
  if [ ! -w "$dir" ]; then
    sudo chown -R "$(id -u):$(id -g)" "$dir"
  fi
done

pnpm install --frozen-lockfile

echo
echo "🔧 Installing Playwright..."
echo
pnpm exec playwright install chromium

echo
echo "🔧 Ensuring Atlas dev database exists on db service..."
_ready=""
for _ in $(seq 1 90); do
  if psql $DATABASE_URL -c 'SELECT 1' >/dev/null 2>&1; then
    _ready=1
    break
  fi
  sleep 1
done
if [ -z "$_ready" ]; then
  echo "⚠️  db service did not become ready in time; skip CREATE DATABASE ${ATLAS_DEV_DB}." >&2
else
  _exists="$(psql $DATABASE_URL -Atc \
    "SELECT 1 FROM pg_database WHERE datname = '${ATLAS_DEV_DB}'" 2>/dev/null || true)"
  if [ "$_exists" != "1" ]; then
    psql $DATABASE_URL -c "CREATE DATABASE \"${ATLAS_DEV_DB}\" WITH OWNER \"${POSTGRES_USER}\";"
    echo "   Created database: ${ATLAS_DEV_DB}"
  else
    echo "   Database already exists: ${ATLAS_DEV_DB}"
  fi
fi

echo
echo "✅ Setup complete!"
