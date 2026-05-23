#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

for hook in pre-commit commit-msg pre-push; do
  if [ ! -f ".githooks/$hook" ]; then
    echo "Missing hook file: .githooks/$hook" >&2
    exit 1
  fi
done

chmod +x ".githooks/pre-commit" ".githooks/commit-msg" ".githooks/pre-push"
git config core.hooksPath .githooks
git config guard.requireLatestDev true
git config guard.maxFileSizeMB 5

echo "GitHub Free local guard installed for this repository."
echo "Enabled rules:"
echo "- Block commits directly on main/dev."
echo "- Require branch prefixes: feature, fix, docs, test, chore, refactor, hotfix, release, bugfix."
echo "- Require Conventional Commit messages."
echo "- Block .env/private keys/big binary artifacts and files over 5MB."
echo "- Block direct pushes to main/dev."
echo "- Require branch to contain latest origin/dev before push."
