# 🔧 Troubleshooting Registration Error

## ❌ Error Message

```
{
    "error": "Internal Server Error",
    "message": "Failed to register user"
}
```

This error occurs when the registration endpoint fails. Let's troubleshoot step by step.

---

## 🔍 Common Causes & Solutions

### 1. Database Tables Don't Exist ❗ **MOST COMMON**

**Problem:** Database schema hasn't been pushed to the database.

**Solution:**
```bash
cd packages/backend
pnpm db:push
```

**Verify tables exist:**
```sql
-- Connect to PostgreSQL
psql -U postgres -d pathogen

-- Check if tables exist
\dt

-- Should show:
--  users
--  otp_codes
```

---

### 2. Database Connection Error

**Problem:** Database isn't running or credentials are wrong.

**Check:**
1. Is PostgreSQL running?
   ```powershell
   Get-Service postgresql*
   ```

2. Check `.env` file has correct credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pathogen
   DB_USER=postgres
   DB_PASSWORD=your-password
   ```

3. Test database connection:
   ```powershell
   psql -h localhost -p 5432 -U postgres -d pathogen
   ```

---

### 3. Database Doesn't Exist

**Problem:** Database `pathogen` hasn't been created.

**Solution:**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE pathogen;

-- Exit
\q
```

Then push schema:
```bash
cd packages/backend
pnpm db:push
```

---

### 4. Check Server Logs

**Check the backend server console** for detailed error messages. The error should be logged there.

Look for messages like:
- `❌ Database connection error`
- `relation "users" does not exist`
- `password authentication failed`
- `database "pathogen" does not exist`

---

## 🧪 Step-by-Step Fix

### Step 1: Check Database Connection

```bash
cd packages/backend

# Check .env file exists and has DB_PASSWORD
Get-Content .env | Select-String "DB_PASSWORD"
```

If empty, update `.env`:
```env
DB_PASSWORD=your-postgres-password
```

### Step 2: Create Database (if needed)

```sql
psql -U postgres
CREATE DATABASE pathogen;
\q
```

### Step 3: Push Database Schema

```bash
cd packages/backend
pnpm db:push
```

You should see:
```
✅ Schema pushed successfully
```

### Step 4: Verify Tables Created

```sql
psql -U postgres -d pathogen
\dt

-- Should show:
--  public | otp_codes
--  public | users
```

### Step 5: Test Registration Again

Use Postman or run:
```powershell
$body = @{
    email = "test@example.com"
    password = "test123456"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

---

## 📝 Quick Diagnostic Script

Run this PowerShell script to check your setup:

```powershell
Write-Host "=== Database Diagnostic ===" -ForegroundColor Cyan

# Check .env file
Write-Host "`n1. Checking .env file..." -ForegroundColor Yellow
if (Test-Path "packages\backend\.env") {
    $envContent = Get-Content "packages\backend\.env"
    $dbPassword = $envContent | Select-String "DB_PASSWORD="
    if ($dbPassword -and $dbPassword -notlike "*your-*") {
        Write-Host "✅ DB_PASSWORD is set" -ForegroundColor Green
    } else {
        Write-Host "❌ DB_PASSWORD not configured" -ForegroundColor Red
    }
    
    $dbName = $envContent | Select-String "DB_NAME="
    Write-Host "   Database: $($dbName)" -ForegroundColor Gray
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

# Check if PostgreSQL is running
Write-Host "`n2. Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service | Where-Object { $_.Name -like "*postgresql*" -and $_.Status -eq "Running" }
if ($pgService) {
    Write-Host "✅ PostgreSQL is running: $($pgService.Name)" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL service not running" -ForegroundColor Red
    Write-Host "   Start it with: Start-Service postgresql-x64-*" -ForegroundColor Yellow
}

# Test database connection
Write-Host "`n3. Testing database connection..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = (Get-Content "packages\backend\.env" | Select-String "DB_PASSWORD=").ToString().Split('=')[1]
    psql -h localhost -p 5432 -U postgres -d pathogen -c "\dt" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Could not test connection (psql might not be in PATH)" -ForegroundColor Yellow
}

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Cyan
```

---

## 🔄 After Fixing

Once you've fixed the issue:

1. **Restart the backend server:**
   - Stop the current server (Ctrl+C)
   - Start again: `cd packages/backend && pnpm dev`

2. **Test registration again** in Postman

3. **Check server logs** for any new errors

---

## 💡 Common Error Messages & Solutions

| Error Message | Solution |
|---------------|----------|
| `relation "users" does not exist` | Run `pnpm db:push` |
| `database "pathogen" does not exist` | Create database: `CREATE DATABASE pathogen;` |
| `password authentication failed` | Check `DB_PASSWORD` in `.env` |
| `connection refused` | Start PostgreSQL service |
| `could not connect to server` | Check PostgreSQL is running and port 5432 is open |

---

## 📞 Still Not Working?

1. **Check server console logs** - Look for detailed error messages
2. **Verify database schema** - Run `pnpm db:studio` to view database
3. **Test database connection directly** - Use psql or pgAdmin
4. **Check PostgreSQL logs** - Look for connection errors

---

## ✅ Expected Success Response

When registration works, you should see:

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

---

**Most likely fix:** Run `cd packages/backend && pnpm db:push` to create the database tables! 🎯

