$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel
if (-not $repoRoot) {
    throw "This script must be run inside a Git repository."
}

Set-Location $repoRoot

$requiredHooks = @("pre-commit", "commit-msg", "pre-push")
foreach ($hook in $requiredHooks) {
    $hookPath = Join-Path $repoRoot ".githooks\$hook"
    if (-not (Test-Path $hookPath)) {
        throw "Missing hook file: .githooks/$hook"
    }
}

git config core.hooksPath .githooks
git config guard.requireLatestDev true
git config guard.maxFileSizeMB 5

Write-Host "GitHub Free local guard installed for this repository."
Write-Host "Enabled rules:"
Write-Host "- Block commits directly on main/dev."
Write-Host "- Require branch prefixes: feature, fix, docs, test, chore, refactor, hotfix, release, bugfix."
Write-Host "- Require Conventional Commit messages."
Write-Host "- Block .env/private keys/big binary artifacts and files over 5MB."
Write-Host "- Block direct pushes to main/dev."
Write-Host "- Require branch to contain latest origin/dev before push."
