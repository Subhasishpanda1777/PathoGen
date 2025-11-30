# 🔧 Create Database Tables - Manual Instructions

## ✅ Quick Fix: Create Tables Manually

Since `psql` is not in your PATH, here are the steps to create the tables:

---

## Method 1: Using pgAdmin (Easiest)

1. **Open pgAdmin**
2. **Connect to your PostgreSQL server**
3. **Select the `pathogen` database** (or create it if it doesn't exist)
4. **Open Query Tool** (Right-click database → Query Tool)
5. **Copy and paste this SQL:**

```sql
-- Create users table
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

-- Create otp_codes table
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_used ON otp_codes(email, used);
```

6. **Click Execute** (F5 or play button)
7. **Done!** ✅

---

## Method 2: Using Command Line (if psql is installed)

### Find PostgreSQL Installation

PostgreSQL is usually installed at:
- `C:\Program Files\PostgreSQL\<version>\bin\psql.exe`

### Run the SQL Script

**Option A: Using full path:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d pathogen -f packages\backend\scripts\create-tables.sql
```

(Replace `15` with your PostgreSQL version)

**Option B: Add to PATH temporarily:**
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
psql -U postgres -d pathogen -f packages\backend\scripts\create-tables.sql
```

**Option C: Navigate to bin folder:**
```powershell
cd "C:\Program Files\PostgreSQL\15\bin"
.\psql.exe -U postgres -d pathogen -f D:\PathoGen\packages\backend\scripts\create-tables.sql
```

---

## Method 3: Copy SQL File Content

The SQL file is located at:
```
packages/backend/scripts/create-tables.sql
```

You can:
1. Open the file in a text editor
2. Copy all the SQL
3. Paste it into pgAdmin Query Tool or psql
4. Execute it

---

## ✅ Verification

After creating tables, verify they exist:

**In pgAdmin:**
- Expand `pathogen` database
- Expand `Schemas` → `public` → `Tables`
- You should see: `otp_codes` and `users`

**Or using SQL:**
```sql
\dt
```

Should show:
```
 public | otp_codes
 public | users
```

---

## 🎯 After Tables Are Created

1. **Try registration in Postman again** - it should work now!
2. **The error "relation 'users' does not exist" should be gone**

---

## 📝 SQL File Location

The SQL script is saved at:
```
packages/backend/scripts/create-tables.sql
```

You can open this file and copy the SQL to run it manually.

---

**Once tables are created, registration will work! ✅**

