#!/bin/bash
set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
if [ -z "$REPO_ROOT" ]; then
    echo "Error: This script must be run inside a Git repository."
    exit 1
fi

cd "$REPO_ROOT"

echo "============================================="
echo "Generating Backend Project Map (docs/project-map-backend.md)..."
echo "============================================="

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed/found in PATH."
    exit 1
fi

node scripts/generate-backend-map.js

echo ""
echo "Backend project map successfully generated at docs/project-map-backend.md!"

read -p "Do you want to automatically upload this backend map to ChatGPT? (y/n): " choice
case "$choice" in 
  y|Y ) 
    echo ""
    echo "============================================="
    echo "Uploading Backend Project Map to ChatGPT..."
    echo "============================================="
    node scripts/upload-project-map.js project-map-backend.md
    ;;
  * ) 
    echo ""
    echo "Done! You can find the generated file at: docs/project-map-backend.md"
    ;;
esac
