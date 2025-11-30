# Script to push backend folder using Personal Access Token
# Usage: .\push-with-token.ps1 -Token "YOUR_GITHUB_TOKEN"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "🚀 Setting up remote with token..." -ForegroundColor Cyan

# Update remote with token
$remoteUrl = "https://$Token@github.com/NirmanSilicon/Nirman5.0.git"
git remote set-url cipher7 $remoteUrl

Write-Host "✅ Remote updated" -ForegroundColor Green
Write-Host ""

# Verify remote (without showing token)
Write-Host "Remote configured to: https://***@github.com/NirmanSilicon/Nirman5.0.git" -ForegroundColor Yellow
Write-Host ""

# Push backend folder
Write-Host "📦 Pushing backend folder to Cipher7/backend..." -ForegroundColor Cyan
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCESS! Backend folder pushed to Cipher7/backend" -ForegroundColor Green
    Write-Host "View at: https://github.com/NirmanSilicon/Nirman5.0/tree/main/Cipher7/backend" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check:" -ForegroundColor Red
    Write-Host "  1. Token is valid and has 'repo' scope" -ForegroundColor Yellow
    Write-Host "  2. You have access to the repository" -ForegroundColor Yellow
    Write-Host "  3. Token hasn't expired" -ForegroundColor Yellow
}

