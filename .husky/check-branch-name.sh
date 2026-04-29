#!/usr/bin/env sh

branch_name="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"

# Detached HEAD (e.g. CI) should not block local hook execution.
if [ "$branch_name" = "HEAD" ] || [ -z "$branch_name" ]; then
  exit 0
fi

# Conventional Branch policy:
# - protected: main|master|develop|staging
# - feature branches: <type>/<slug>
# - types: feat|fix|chore|docs|refactor|test|ci|perf|build|style|revert
# - slug: lowercase letters/numbers with hyphen-separated segments
pattern='^(main|master|develop|staging|((feat|fix|chore|docs|refactor|test|ci|perf|build|style|revert)/[a-z0-9]+(-[a-z0-9]+)*))$'

if printf "%s" "$branch_name" | grep -Eq "$pattern"; then
  exit 0
fi

echo "Invalid branch name: $branch_name"
echo "Expected:"
echo "  main | master | develop | staging"
echo "  or <type>/<description>"
echo "  type: feat|fix|chore|docs|refactor|test|ci|perf|build|style|revert"
echo "  description: lowercase letters/numbers and hyphens only"
exit 1
