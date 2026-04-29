#!/usr/bin/env sh

branch_name="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"

# Detached HEAD (e.g. CI) should not block local hook execution.
if [ "$branch_name" = "HEAD" ] || [ -z "$branch_name" ]; then
  exit 0
fi

# Conventional Branch 1.0.0 policy:
# Reference: https://conventional-branch.github.io/#specification
# - trunk: main|develop|staging
# - prefixed: <type>/<description>
# - types: feature|feat|bugfix|fix|hotfix|release|chore
# - description: desc-segment *("-" desc-segment)
# - desc-segment: [a-z0-9]+ *("." [a-z0-9]+)
pattern='^(main|develop|staging|((feature|feat|bugfix|fix|hotfix|release|chore)/[a-z0-9]+(\.[a-z0-9]+)*(-[a-z0-9]+(\.[a-z0-9]+)*)*))$'

if printf "%s" "$branch_name" | grep -Eq "$pattern"; then
  exit 0
fi

echo "Invalid branch name: $branch_name"
echo "Expected:"
echo "  main | develop | staging"
echo "  or <type>/<description>"
echo "  type: feature|feat|bugfix|fix|hotfix|release|chore"
echo "  description: lowercase letters/numbers with hyphens and optional dots"
exit 1
