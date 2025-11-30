# Restart PathoGen Server
Write-Host "🔄 Restarting PathoGen Server..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop existing server
Write-Host "🛑 Stopping existing server processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Stopped $($nodeProcesses.Count) Node process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "ℹ️ No Node processes running" -ForegroundColor Gray
}

# Step 2: Build backend (if TypeScript)
Write-Host ""
Write-Host "🔨 Building backend..." -ForegroundColor Yellow
Set-Location packages/backend
try {
    pnpm build
    Write-Host "✅ Build complete" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Build failed or not needed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 3: Start server
Write-Host ""
Write-Host "🚀 Starting server..." -ForegroundColor Yellow
Set-Location ../..
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm dev" -WindowStyle Normal
    Write-Host "✅ Server starting in new window" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Wait for server to start (check new window)" -ForegroundColor Gray
    Write-Host "   2. Test endpoint: .\test-email-notifications.ps1" -ForegroundColor Gray
    Write-Host "   3. Test daily emails: .\test-daily-emails.ps1" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to start server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Try manually: pnpm dev" -ForegroundColor Yellow
}

