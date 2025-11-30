# Test Email Notifications Endpoint
Write-Host "🧪 Testing Email Notifications Endpoint" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if server is running
Write-Host "1. Checking if server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "   Status: $($healthCheck.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    Write-Host "   Please start the server first: cd packages/backend && pnpm dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Testing email notifications endpoint (requires authentication)..." -ForegroundColor Yellow
Write-Host "   Endpoint: PUT http://localhost:5000/api/auth/email-notifications" -ForegroundColor Gray
Write-Host "   Note: This endpoint requires a valid JWT token" -ForegroundColor Gray
Write-Host ""
Write-Host "   To test:" -ForegroundColor Yellow
Write-Host "   1. Login first to get a token" -ForegroundColor Gray
Write-Host "   2. Use the token in Authorization header: Bearer <token>" -ForegroundColor Gray
Write-Host "   3. Send PUT request with body: { 'enabled': true }" -ForegroundColor Gray

Write-Host ""
Write-Host "3. Testing without auth (should return 401)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-notifications" -Method PUT -ContentType "application/json" -Body '{"enabled": true}' -ErrorAction Stop
    Write-Host "⚠️ Unexpected: Got response without auth" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Correctly requires authentication (401)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ Endpoint not found (404) - Route may not be registered!" -ForegroundColor Red
        Write-Host "   Check: packages/backend/src/routes/auth.routes.ts" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ Got status code: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Test complete!" -ForegroundColor Green

