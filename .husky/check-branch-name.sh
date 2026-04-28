#!/usr/bin/env sh

branch_name="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"

# Detached HEAD (e.g. CI) should not block local hook execution.
if [ "$branch_name" = "HEAD" ] || [ -z "$branch_name" ]; then
  exit 0
fi

# Conventional Branch 1.0.0 aligned pattern:
# - trunk: main|master|develop
# - prefixed: feature|feat|bugfix|fix|hotfix|release|chore
# - description: lowercase letters/numbers with hyphen-separated segments
#   and optional dot-separated version-like parts inside each segment.
pattern='^(main|master|develop|((feature|feat|bugfix|fix|hotfix|release|chore)/[a-z0-9]+(\.[a-z0-9]+)*(-[a-z0-9]+(\.[a-z0-9]+)*)*))$'

if printf "%s" "$branch_name" | grep -Eq "$pattern"; then
  exit 0
fi

echo "Invalid branch name: $branch_name"
echo "Expected:"
echo "  main | master | develop"
echo "  or <type>/<description>"
echo "  type: feature|feat|bugfix|fix|hotfix|release|chore"
echo "  description: lowercase letters/numbers, hyphens, optional dots"
exit 1
