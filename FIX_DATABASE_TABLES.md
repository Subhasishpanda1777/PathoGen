# 🚨 Fix: "relation 'users' does not exist"

## ✅ Solution: Create Database Tables

The error occurs because the database tables haven't been created yet.

---

## 🎯 Quick Fix (Choose One Method)

### Method 1: pgAdmin (Recommended - Easiest)

1. Open **pgAdmin**
2. Connect to PostgreSQL
3. Right-click on `pathogen` database → **Query Tool**
4. Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_used ON otp_codes(email, used);
```

5. Click **Execute** (F5)
6. Done! ✅

---

### Method 2: Command Line

If you know where PostgreSQL is installed:

```powershell
# Find your PostgreSQL version (usually 14, 15, or 16)
# Then run:
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d pathogen -f packages\backend\scripts\create-tables.sql
```

---

### Method 3: Copy SQL File

1. Open: `packages/backend/scripts/create-tables.sql`
2. Copy all SQL
3. Paste into pgAdmin Query Tool
4. Execute

---

## ✅ After Creating Tables

1. **Restart backend server** (if needed)
2. **Try registration in Postman again**
3. **Should work now!** ✅

---

## 📋 What Tables Are Created

- **`users`** - Stores user accounts
- **`otp_codes`** - Stores OTP codes for authentication

Both tables are required for the authentication system to work.

---

**Once tables are created, the registration error will be fixed! 🎉**

