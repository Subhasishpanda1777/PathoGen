# 🚨 Quick Fix: Registration Error

## ❌ Error: "Failed to register user"

**Most Common Cause:** Database tables don't exist

---

## ✅ Quick Fix (2 Steps)

### Step 1: Push Database Schema

```bash
cd packages/backend
pnpm db:push
```

This will create the `users` and `otp_codes` tables.

---

### Step 2: Test Again

Try registering in Postman again. It should work now!

---

## 🔍 If That Doesn't Work

### Check Database Exists:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Check if database exists
\l

-- If pathogen database doesn't exist, create it:
CREATE DATABASE pathogen;

-- Exit
\q
```

### Then push schema again:

```bash
cd packages/backend
pnpm db:push
```

---

## 📝 Verification

After running `pnpm db:push`, verify tables exist:

```sql
psql -U postgres -d pathogen

-- List tables
\dt

-- Should show:
--  public | otp_codes
--  public | users
```

---

## 🎯 Most Likely Solution

**Just run this:**

```bash
cd packages/backend
pnpm db:push
```

Then try registering again! ✅

---

## 📚 Full Troubleshooting

See `TROUBLESHOOTING_REGISTRATION_ERROR.md` for complete guide.

