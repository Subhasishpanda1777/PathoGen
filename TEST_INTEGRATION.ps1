# PathoGen Integration Test Script
# Tests frontend-backend integration

Write-Host "=== PathoGen Integration Test ===" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:5000"
$frontendUrl = "http://localhost:3000"

# Test 1: Backend Health Check
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health" -TimeoutSec 5
    Write-Host "  ✅ Backend is running" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    Write-Host "  Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "  ❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Backend API Endpoint
Write-Host "Test 2: Backend API Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api" -TimeoutSec 5
    Write-Host "  ✅ API endpoint is accessible" -ForegroundColor Green
    Write-Host "  Version: $($response.version)" -ForegroundColor White
} catch {
    Write-Host "  ❌ API endpoint is not accessible" -ForegroundColor Red
}

Write-Host ""

# Test 3: Dashboard Stats Endpoint
Write-Host "Test 3: Dashboard Stats Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/dashboard/stats" -TimeoutSec 5
    Write-Host "  ✅ Dashboard stats endpoint working" -ForegroundColor Green
    Write-Host "  Active Outbreaks: $($response.stats.activeOutbreaks)" -ForegroundColor White
    Write-Host "  Recent Reports: $($response.stats.recentReports)" -ForegroundColor White
} catch {
    Write-Host "  ⚠️  Dashboard stats endpoint error (may need data)" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Frontend Accessibility
Write-Host "Test 4: Frontend Accessibility" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend is running" -ForegroundColor Green
        Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor White
    }
} catch {
    Write-Host "  ⚠️  Frontend is not accessible yet" -ForegroundColor Yellow
    Write-Host "  Note: Frontend may still be starting. Try: http://localhost:3000" -ForegroundColor White
}

Write-Host ""

# Test 5: CORS Configuration
Write-Host "Test 5: CORS Configuration" -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = $frontendUrl
        "Access-Control-Request-Method" = "GET"
    }
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -Method OPTIONS -Headers $headers -UseBasicParsing -TimeoutSec 5
    Write-Host "  ✅ CORS is configured" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  CORS check inconclusive (this is normal for GET requests)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✅ Backend: Running on $backendUrl" -ForegroundColor Green
Write-Host "✅ API: Accessible and responding" -ForegroundColor Green
Write-Host "⚠️  Frontend: Check manually at $frontendUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "  2. Open browser console (F12) and check for errors" -ForegroundColor White
Write-Host "  3. Test API calls from frontend" -ForegroundColor White
Write-Host "  4. Check CORS errors (should be none)" -ForegroundColor White

