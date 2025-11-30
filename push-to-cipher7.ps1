# Script to push backend and locaton json folders to Cipher7 repository
# Make sure you have authentication set up for the NirmanSilicon/Nirman5.0 repository

Write-Host "🚀 Preparing to push backend and locaton json folders to Cipher7..." -ForegroundColor Cyan

# Check if we're on the right branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

# Add remote if not exists
$remotes = git remote
if ($remotes -notcontains "cipher7") {
    Write-Host "Adding cipher7 remote..." -ForegroundColor Yellow
    git remote add cipher7 https://github.com/NirmanSilicon/Nirman5.0.git
} else {
    Write-Host "cipher7 remote already exists" -ForegroundColor Green
}

# Push backend folder using subtree
Write-Host "`n📦 Pushing backend folder to Cipher7/backend..." -ForegroundColor Cyan
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend folder pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push backend folder. Check authentication." -ForegroundColor Red
    Write-Host "You may need to:" -ForegroundColor Yellow
    Write-Host "  1. Set up a Personal Access Token (PAT) in GitHub" -ForegroundColor Yellow
    Write-Host "  2. Use: git remote set-url cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git" -ForegroundColor Yellow
    Write-Host "  3. Or use SSH: git remote set-url cipher7 git@github.com:NirmanSilicon/Nirman5.0.git" -ForegroundColor Yellow
    exit 1
}

# Push locaton json folder using subtree
# Note: Git subtree has issues with spaces, so we'll use a workaround
Write-Host "`n📦 Pushing locaton json folder to Cipher7..." -ForegroundColor Cyan
# Use a branch-based approach for folders with spaces
git subtree push --prefix="locaton json" cipher7 main:Cipher7/locaton-json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ locaton json folder pushed successfully!" -ForegroundColor Green
    Write-Host "`n🎉 All folders pushed successfully to Cipher7!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push locaton json folder. Check authentication." -ForegroundColor Red
    exit 1
}

