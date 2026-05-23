#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [ ! -f ".githooks/pre-push" ]; then
  echo "Missing hook file: .githooks/pre-push" >&2
  exit 1
fi

chmod +x ".githooks/pre-push"
git config core.hooksPath .githooks

echo "Git hooks installed for this repository."
echo "Direct pushes to main and dev are now blocked in this clone."
echo "Use feature/fix/docs branches and merge through Pull Requests."
