# 🔧 Fix Email Notifications 404 Error

## Problem
The endpoint `/api/auth/email-notifications` returns 404 (Not Found).

## Root Cause
The server is running old code. The route exists in the source code but hasn't been loaded because the server needs to be restarted.

## Solution

### Step 1: Stop the Current Server
```powershell
# Find and stop Node processes
Get-Process -Name node | Stop-Process -Force
```

### Step 2: Rebuild (if using TypeScript)
```powershell
cd packages/backend
pnpm build
```

### Step 3: Restart the Server
```powershell
# From root directory
pnpm dev

# Or from backend directory
cd packages/backend
pnpm dev
```

### Step 4: Verify the Route is Registered
After restart, check server logs for:
```
🚀 PathoGen API Server running on http://localhost:5000
```

Then test:
```powershell
.\test-email-notifications.ps1
```

## Verification

### Test 1: Check Route Exists
```powershell
# Should return 401 (Unauthorized) not 404 (Not Found)
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-notifications" -Method PUT -ContentType "application/json" -Body '{"enabled": true}'
```

**Expected**: 401 Unauthorized (route exists, needs auth)
**If 404**: Server still running old code - restart again

### Test 2: Test with Authentication
1. Login to get a token
2. Use token in request:
```powershell
$token = "your-jwt-token-here"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{ enabled = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-notifications" -Method PUT -Headers $headers -Body $body
```

**Expected**: Success response with `emailNotificationsEnabled: true`

## All Fixes Applied

✅ **Route Definition**: Correctly defined in `packages/backend/src/routes/auth.routes.ts`
✅ **Route Registration**: Properly registered in `packages/backend/src/index.ts`
✅ **Cron Schedule**: Fixed to `"56 16 * * *"` (4:56 PM IST)
✅ **Disease Fetching**: Updated to match website exactly (30 days, same grouping)
✅ **Email Format**: Changed to "Daily Email Analysis"
✅ **Test Endpoint**: Removed admin requirement from `/api/alerts/daily-emails`

## Quick Restart Script

Save as `restart-server.ps1`:
```powershell
Write-Host "🛑 Stopping server..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "🔨 Building backend..." -ForegroundColor Yellow
cd packages/backend
pnpm build

Write-Host "🚀 Starting server..." -ForegroundColor Yellow
cd ../..
pnpm dev
```

Run: `.\restart-server.ps1`

