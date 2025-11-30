# 🗄️ Quick Local Database Setup

## ✅ What Changed

The database configuration now uses **individual parameters** instead of a connection string, making it easier to configure your local PostgreSQL database.

---

## 📝 Update Your .env File

Open `packages/backend/.env` and update these values:

```env
# Local Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pathogen
DB_USER=postgres
DB_PASSWORD=your-actual-postgres-password  # ← Update this!
```

---

## 🔧 Quick Steps

### 1. Make Sure PostgreSQL is Running

**Windows:**
```powershell
Get-Service postgresql*
```

**If not running, start it:**
```powershell
Start-Service postgresql-x64-14  # Adjust version number if different
```

### 2. Create the Database

Open PostgreSQL command line:
```bash
psql -U postgres
```

Then create the database:
```sql
CREATE DATABASE pathogen;
\q
```

### 3. Update .env File

Edit `packages/backend/.env`:
```env
DB_PASSWORD=your-postgres-password-here
```

Replace `your-postgres-password-here` with the password you set when installing PostgreSQL.

### 4. Push Database Schema

```bash
cd packages/backend
pnpm db:push
```

This will create all tables in your local database.

---

## ✅ Configuration Format

**Current (Individual Parameters):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pathogen
DB_USER=postgres
DB_PASSWORD=your-password
```

**Alternative (Connection String - if you prefer):**
```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/pathogen
```

The code supports both methods. Individual parameters are recommended for local development.

---

## 🎯 That's It!

Just update `DB_PASSWORD` in your `.env` file with your actual PostgreSQL password and you're ready to go!

For detailed setup instructions, see `LOCAL_DATABASE_SETUP.md`.

