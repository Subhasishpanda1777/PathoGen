# Script to push ONLY backend folder to Cipher7/backend
# Repository: https://github.com/NirmanSilicon/Nirman5.0/tree/main/Cipher7

Write-Host "🚀 Pushing backend folder to Cipher7/backend..." -ForegroundColor Cyan
Write-Host "Repository: https://github.com/NirmanSilicon/Nirman5.0" -ForegroundColor Yellow
Write-Host "Target: Cipher7/backend" -ForegroundColor Yellow
Write-Host ""

# Check remote
$remotes = git remote
if ($remotes -notcontains "cipher7") {
    Write-Host "Adding cipher7 remote..." -ForegroundColor Yellow
    git remote add cipher7 https://github.com/NirmanSilicon/Nirman5.0.git
}

# Show current remote
Write-Host "Current remote URL:" -ForegroundColor Cyan
git remote get-url cipher7
Write-Host ""

# Attempt push
Write-Host "📦 Pushing backend folder..." -ForegroundColor Cyan
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCESS! Backend folder pushed to Cipher7/backend" -ForegroundColor Green
    Write-Host "View at: https://github.com/NirmanSilicon/Nirman5.0/tree/main/Cipher7/backend" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed due to authentication" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix this, you need to authenticate:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Personal Access Token (Recommended)" -ForegroundColor Cyan
    Write-Host "  1. Create token at: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "  2. Select 'repo' scope" -ForegroundColor White
    Write-Host "  3. Run: git remote set-url cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git" -ForegroundColor White
    Write-Host "  4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: SSH Key" -ForegroundColor Cyan
    Write-Host "  1. Set up SSH key in GitHub" -ForegroundColor White
    Write-Host "  2. Run: git remote set-url cipher7 git@github.com:NirmanSilicon/Nirman5.0.git" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

