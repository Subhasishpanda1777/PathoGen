# PathoGen API Test Script
# Run this script to test all API endpoints

$baseUrl = "http://localhost:5000"
$testEmail = "test@example.com"
$testPassword = "test123456"

Write-Host "=== Testing PathoGen API ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health: $($health.status) - $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. API Info
Write-Host "2. Testing API Info..." -ForegroundColor Yellow
try {
    $apiInfo = Invoke-RestMethod -Uri "$baseUrl/api" -Method GET
    Write-Host "✅ API Version: $($apiInfo.version)" -ForegroundColor Green
} catch {
    Write-Host "❌ API info failed: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Register User
Write-Host "3. Testing User Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        email = $testEmail
        password = $testPassword
        name = "Test User"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registered: $($registerResponse.user.email)" -ForegroundColor Green
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "⚠️  Registration: $errorMessage" -ForegroundColor Yellow
    if ($errorMessage -like "*already exists*") {
        Write-Host "   (User already exists, continuing...)" -ForegroundColor Gray
    }
}
Write-Host ""

# 4. Login
Write-Host "4. Testing Login (Sending OTP)..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login: $($loginResponse.message)" -ForegroundColor Green
    Write-Host "   ⚠️  Check your email for OTP code" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   (Make sure database is configured and user exists)" -ForegroundColor Gray
    exit 1
}
Write-Host ""

# 5. Verify OTP (requires manual OTP input)
Write-Host "5. Testing OTP Verification..." -ForegroundColor Yellow
Write-Host "   Enter the OTP code you received in your email" -ForegroundColor Gray
$otp = Read-Host "OTP Code"
try {
    $verifyBody = @{
        email = $testEmail
        otp = $otp
    } | ConvertTo-Json

    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify-otp" -Method POST -Body $verifyBody -ContentType "application/json"
    $token = $verifyResponse.token
    Write-Host "✅ OTP Verified! Token received" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    
    # 6. Get User Info
    Write-Host ""
    Write-Host "6. Testing Get Current User..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
    Write-Host "✅ Current User: $($meResponse.user.email) (Role: $($meResponse.user.role))" -ForegroundColor Green
    Write-Host "   Name: $($meResponse.user.name)" -ForegroundColor Gray
    Write-Host "   Verified: $($meResponse.user.isVerified)" -ForegroundColor Gray
    
    # Save token for later use
    $token | Out-File -FilePath "token.txt" -Encoding utf8
    Write-Host ""
    Write-Host "💾 Token saved to token.txt for later use" -ForegroundColor Cyan
} catch {
    Write-Host "❌ OTP verification failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*Invalid OTP*") {
        Write-Host "   Make sure you entered the correct OTP code" -ForegroundColor Yellow
    }
    if ($_.Exception.Message -like "*Expired*") {
        Write-Host "   OTP has expired. Please login again to get a new OTP" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan

