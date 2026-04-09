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
echo "✅ Setup complete!"
