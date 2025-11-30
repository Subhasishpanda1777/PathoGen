# 🧪 API Testing Guide - PathoGen Backend

Complete guide for testing all API endpoints with examples and test commands.

---

## 📋 Table of Contents

1. [Base URL](#base-url)
2. [System Endpoints](#system-endpoints)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Testing with PowerShell](#testing-with-powershell)
5. [Testing with cURL](#testing-with-curl)
6. [Testing with Postman](#testing-with-postman)

---

## 🌐 Base URL

```
http://localhost:5000
```

---

## 🔧 System Endpoints

### 1. Health Check

**GET** `/health`

**Description:** Check if the server is running

**Request:**
```http
GET http://localhost:5000/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "PathoGen API Server is running",
  "timestamp": "2025-11-25T18:41:45.221Z"
}
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
```

**cURL:**
```bash
curl http://localhost:5000/health
```

---

### 2. API Information

**GET** `/api`

**Description:** Get information about all available API endpoints

**Request:**
```http
GET http://localhost:5000/api
```

**Response (200 OK):**
```json
{
  "message": "PathoGen API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "api": "/api",
    "auth": {
      "register": "POST /api/auth/register",
      "login": "POST /api/auth/login",
      "sendOTP": "POST /api/auth/send-otp",
      "verifyOTP": "POST /api/auth/verify-otp",
      "resendOTP": "POST /api/auth/resend-otp",
      "me": "GET /api/auth/me"
    }
  }
}
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET
```

**cURL:**
```bash
curl http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints

### 1. Register User

**POST** `/api/auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully. Please verify your email with OTP.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "User with this email already exists"
}
```

**Validation Error (400):**
```json
{
  "error": "Validation Error",
  "message": "Invalid email address"
}
```

**PowerShell:**
```powershell
$body = @{
    email = "user@example.com"
    password = "password123"
    name = "John Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

---

### 2. Login (Send OTP)

**POST** `/api/auth/login`

**Description:** Login with email and password, sends OTP to email

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP sent to your email. Please verify to complete login."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

**Email Error (500):**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to send OTP email. Please check email configuration."
}
```

**PowerShell:**
```powershell
$body = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### 3. Verify OTP

**POST** `/api/auth/verify-otp`

**Description:** Verify OTP code and get JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isVerified": true
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid OTP",
  "message": "Incorrect OTP code"
}
```

**Expired OTP (400):**
```json
{
  "error": "Expired OTP",
  "message": "OTP has expired. Please request a new one."
}
```

**PowerShell:**
```powershell
$body = @{
    email = "user@example.com"
    otp = "123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-otp" -Method POST -Body $body -ContentType "application/json"
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Save token from response:**
```bash
# Store token in variable (PowerShell)
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-otp" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
```

---

### 4. Resend OTP

**POST** `/api/auth/resend-otp`

**Description:** Resend OTP code to user's email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP resent to your email"
}
```

**PowerShell:**
```powershell
$body = @{
    email = "user@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/resend-otp" -Method POST -Body $body -ContentType "application/json"
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

### 5. Get Current User (Protected)

**GET** `/api/auth/me`

**Description:** Get current authenticated user information

**Headers Required:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isVerified": true
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "No authentication token provided"
}
```

**Invalid Token (401):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**PowerShell:**
```powershell
$token = "your-jwt-token-here"
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

**cURL:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer your-jwt-token-here"
```

---

## 🔄 Complete Authentication Flow Example

### Step-by-Step Test Flow:

**1. Register a new user:**
```powershell
$registerBody = @{
    email = "test@example.com"
    password = "test123456"
    name = "Test User"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
Write-Host "Registered user: $($registerResponse.user.email)"
```

**2. Login (send OTP):**
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "test123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
Write-Host $loginResponse.message
Write-Host "Check your email for OTP code"
```

**3. Verify OTP (get token):**
```powershell
# Replace "123456" with actual OTP from email
$verifyBody = @{
    email = "test@example.com"
    otp = "123456"
} | ConvertTo-Json

$verifyResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-otp" -Method POST -Body $verifyBody -ContentType "application/json"
$token = $verifyResponse.token
Write-Host "Token received: $token"
```

**4. Use token to get user info:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$meResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
Write-Host "Current user: $($meResponse.user.email)"
```

---

## 📝 Complete Test Script (PowerShell)

Save this as `test-api.ps1`:

```powershell
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
    Write-Host "⚠️  Registration: $($_.Exception.Message)" -ForegroundColor Yellow
    if ($_.Exception.Message -like "*already exists*") {
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
}
Write-Host ""

# 5. Verify OTP (requires manual OTP input)
Write-Host "5. Testing OTP Verification..." -ForegroundColor Yellow
$otp = Read-Host "Enter OTP from email"
try {
    $verifyBody = @{
        email = $testEmail
        otp = $otp
    } | ConvertTo-Json

    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify-otp" -Method POST -Body $verifyBody -ContentType "application/json"
    $token = $verifyResponse.token
    Write-Host "✅ OTP Verified! Token received" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    
    # 6. Get User Info
    Write-Host ""
    Write-Host "6. Testing Get Current User..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
    Write-Host "✅ Current User: $($meResponse.user.email) ($($meResponse.user.role))" -ForegroundColor Green
} catch {
    Write-Host "❌ OTP verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
```

**Run the test script:**
```powershell
.\test-api.ps1
```

---

## 📮 Postman Collection

You can import these endpoints into Postman:

**Collection JSON:**
```json
{
  "info": {
    "name": "PathoGen API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\",\n  \"name\": \"John Doe\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Verify OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@example.com\",\n  \"otp\": \"123456\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/verify-otp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "verify-otp"]
        }
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "http://localhost:5000/api/auth/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "me"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## 🎯 Quick Reference Links

### System Endpoints:
- Health: `http://localhost:5000/health`
- API Info: `http://localhost:5000/api`

### Authentication Endpoints:
- Register: `http://localhost:5000/api/auth/register`
- Login: `http://localhost:5000/api/auth/login`
- Verify OTP: `http://localhost:5000/api/auth/verify-otp`
- Resend OTP: `http://localhost:5000/api/auth/resend-otp`
- Get User: `http://localhost:5000/api/auth/me`

---

## ✅ Testing Checklist

- [ ] Health check endpoint
- [ ] API info endpoint
- [ ] User registration
- [ ] Login (OTP sent)
- [ ] OTP verification (token received)
- [ ] Protected route access (using token)
- [ ] Error handling (invalid credentials, expired OTP, etc.)

---

**Happy Testing! 🚀**

