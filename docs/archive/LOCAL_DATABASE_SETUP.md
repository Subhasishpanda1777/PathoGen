# 🗄️ Local Database Setup Guide

## Overview

PathoGen is configured to use a **local PostgreSQL database**. You can configure it using individual parameters (recommended) or a connection string.

---

## ✅ Current Configuration (Individual Parameters)

The `.env` file now uses individual database parameters instead of a connection string:

```env
# Local Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pathogen
DB_USER=postgres
DB_PASSWORD=your-postgres-password
```

---

## 📝 Step-by-Step Setup

### 1. Install PostgreSQL (if not already installed)

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for the `postgres` user

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

### 2. Create the Database

Open PostgreSQL command line or pgAdmin and run:

```sql
CREATE DATABASE pathogen;
```

**Or using command line:**
```bash
# Windows (open Command Prompt as Administrator)
psql -U postgres

# Then in psql prompt:
CREATE DATABASE pathogen;
\q
```

**Or using PowerShell:**
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pathogen;

# Exit
\q
```

---

### 3. Update .env File

Edit `packages/backend/.env` and update these values:

```env
DB_HOST=localhost           # Usually localhost
DB_PORT=5432               # Default PostgreSQL port
DB_NAME=pathogen           # Database name you created
DB_USER=postgres           # PostgreSQL username (usually postgres)
DB_PASSWORD=your-actual-postgres-password  # Your PostgreSQL password
```

**Example:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pathogen
DB_USER=postgres
DB_PASSWORD=mypostgrespassword123
```

---

### 4. Test Database Connection

**Using psql:**
```bash
psql -h localhost -p 5432 -U postgres -d pathogen
```

If it prompts for password and connects successfully, your credentials are correct!

---

### 5. Push Database Schema

Once your `.env` is configured, push the database schema:

```bash
cd packages/backend
pnpm db:push
```

This will create all the necessary tables in your local database.

---

## 🔄 Alternative: Using Connection String

If you prefer using a connection string instead, you can use:

**Option 1: Comment out individual parameters and uncomment DATABASE_URL**
```env
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=pathogen
# DB_USER=postgres
# DB_PASSWORD=your-password

DATABASE_URL=postgresql://postgres:your-password@localhost:5432/pathogen
```

**Connection string format:**
```
postgresql://username:password@host:port/database
```

---

## ✅ Verification

### Check if PostgreSQL is Running

**Windows:**
```powershell
Get-Service postgresql*
```

**macOS/Linux:**
```bash
sudo systemctl status postgresql
# or
brew services list | grep postgresql
```

### Test Connection from Application

After setting up, start your backend:
```bash
cd packages/backend
pnpm dev
```

If the database connection is successful, you'll see the server start without errors.

If there's an error, check:
- PostgreSQL is running
- Database name exists
- Username and password are correct
- Port 5432 is not blocked

---

## 🛠️ Common Issues & Solutions

### Issue 1: "FATAL: password authentication failed"

**Solution:** 
- Check `DB_PASSWORD` in `.env` matches your PostgreSQL password
- Reset PostgreSQL password if needed:
  ```sql
  ALTER USER postgres WITH PASSWORD 'newpassword';
  ```

### Issue 2: "FATAL: database 'pathogen' does not exist"

**Solution:**
```sql
CREATE DATABASE pathogen;
```

### Issue 3: "connection refused" or "could not connect"

**Solution:**
- Check PostgreSQL service is running
- Verify `DB_HOST` is `localhost`
- Check `DB_PORT` is `5432` (or your custom port)
- Check PostgreSQL is listening on localhost (check `postgresql.conf`)

### Issue 4: "role 'postgres' does not exist"

**Solution:**
- Use your actual PostgreSQL username instead of `postgres`
- Or create the postgres user:
  ```sql
  CREATE USER postgres WITH PASSWORD 'yourpassword';
  ALTER USER postgres CREATEDB;
  ```

---

## 📊 Default PostgreSQL Credentials

If you just installed PostgreSQL, the default credentials are usually:

- **Host:** `localhost` or `127.0.0.1`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** (set during installation)
- **Database:** (needs to be created - we use `pathogen`)

---

## 🔍 Check Your PostgreSQL Setup

**List all databases:**
```sql
\l
```

**List all users:**
```sql
\du
```

**Connect to specific database:**
```sql
\c pathogen
```

**List tables in current database:**
```sql
\dt
```

---

## 🚀 After Database Setup

Once your database is configured and schema is pushed:

1. **Verify tables were created:**
   ```sql
   \c pathogen
   \dt
   ```
   You should see tables like `users` and `otp_codes`.

2. **Start your application:**
   ```bash
   pnpm dev
   ```

3. **Test the connection:**
   - Backend health check: http://localhost:5000/health
   - Should return successful response

---

## 📝 Quick Setup Checklist

- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Database `pathogen` created
- [ ] Updated `.env` with correct credentials:
  - [ ] `DB_HOST=localhost`
  - [ ] `DB_PORT=5432`
  - [ ] `DB_NAME=pathogen`
  - [ ] `DB_USER=postgres` (or your username)
  - [ ] `DB_PASSWORD=your-password`
- [ ] Tested connection using `psql`
- [ ] Ran `pnpm db:push` to create tables
- [ ] Verified tables exist in database

---

## 🎯 Summary

The database configuration now supports **local PostgreSQL** using individual parameters:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pathogen
DB_USER=postgres
DB_PASSWORD=your-password
```

Just update the `DB_PASSWORD` with your actual PostgreSQL password and you're good to go!

