$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel
if (-not $repoRoot) {
    throw "This script must be run inside a Git repository."
}

Set-Location $repoRoot

$hookPath = Join-Path $repoRoot ".githooks\pre-push"
if (-not (Test-Path $hookPath)) {
    throw "Missing hook file: .githooks/pre-push"
}

git config core.hooksPath .githooks

Write-Host "Git hooks installed for this repository."
Write-Host "Direct pushes to main and dev are now blocked in this clone."
Write-Host "Use feature/fix/docs branches and merge through Pull Requests."
