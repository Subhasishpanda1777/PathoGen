# 🚀 Quick Setup Guide - PathoGen

## ✅ What's Already Done

- ✅ Monorepo structure set up
- ✅ Dependencies installed
- ✅ Environment files created
- ✅ Google OAuth removed (using email-based OTP instead)

## 📝 Environment Variables Setup

### 1. Backend `.env` File (`packages/backend/.env`)

**Current Configuration:**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/pathogen
JWT_SECRET=pathogen-dev-secret-key-change-in-production-min-32-chars
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
SENTRY_DSN=
ENCRYPTION_KEY=
```

**What You Need to Update:**

1. **DATABASE_URL** - Update with your PostgreSQL credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/pathogen
   ```

2. **EMAIL_USER** - Your Gmail address:
   ```env
   EMAIL_USER=youremail@gmail.com
   ```

3. **EMAIL_PASSWORD** - Gmail App Password (see below):
   ```env
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

4. **ENCRYPTION_KEY** - Generate using:
   ```bash
   cd packages/backend
   node scripts/generate-encryption-key.js
   ```
   Then copy the generated key to `.env`

5. **SENTRY_DSN** (Optional) - Get from [sentry.io](https://sentry.io)

6. **JWT_SECRET** - Change to a secure random string (32+ characters)

---

### 2. Frontend `.env.local` File (`packages/frontend/.env.local`)

**Current Configuration:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SENTRY_DSN=
```

**What You Need to Update:**

1. **NEXT_PUBLIC_SENTRY_DSN** (Optional) - Same as backend Sentry DSN

---

## 🔑 How to Get Each Value

### 1. PostgreSQL Database URL

**If you have PostgreSQL installed locally:**
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/pathogen
```

**To create the database:**
```sql
CREATE DATABASE pathogen;
```

**Common default credentials:**
- Username: `postgres`
- Password: (set during PostgreSQL installation)
- Port: `5432`
- Database: `pathogen` (create this)

---

### 2. Gmail App Password (for sending OTP emails)

**Step 1:** Enable 2-Step Verification
- Go to [Google Account Security](https://myaccount.google.com/security)
- Enable **2-Step Verification**

**Step 2:** Generate App Password
- Go to [App Passwords](https://myaccount.google.com/apppasswords)
- Select **"Mail"** → **"Other (Custom name)"**
- Enter "PathoGen"
- Click **"Generate"**
- Copy the 16-character password (remove spaces)

**Step 3:** Add to `.env`
```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # 16 characters, no spaces
```

---

### 3. Encryption Key

**Generate using the provided script:**
```bash
cd packages/backend
node scripts/generate-encryption-key.js
```

**Or using Node.js directly:**
```bash
node -e "import('crypto').then(c => console.log(c.default.randomBytes(32).toString('base64')))"
```

**Or using PowerShell (Windows):**
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

**Copy the output and add to `.env`:**
```env
ENCRYPTION_KEY=your-generated-key-here
```

---

### 4. Sentry DSN (Optional)

**Step 1:** Create account at [sentry.io](https://sentry.io)

**Step 2:** Create a new project
- Select **"Node.js"** platform
- Name it "PathoGen Backend"

**Step 3:** Copy the DSN
- It looks like: `https://abc123@o1234567.ingest.sentry.io/1234567`

**Step 4:** Add to both `.env` files:
- Backend: `SENTRY_DSN=https://...`
- Frontend: `NEXT_PUBLIC_SENTRY_DSN=https://...`

---

### 5. JWT Secret

Generate a secure random string (32+ characters):

**Using Node.js:**
```bash
node -e "import('crypto').then(c => console.log(c.default.randomBytes(32).toString('hex')))"
```

**Or use an online generator:**
- [RandomKeygen](https://randomkeygen.com/)
- Generate a "CodeIgniter Encryption Keys" (32 characters)

**Add to `.env`:**
```env
JWT_SECRET=your-secure-random-string-32-characters-minimum
```

---

## 🚀 After Configuration

### 1. Push Database Schema
```bash
cd packages/backend
pnpm db:push
```

### 2. Start Development Servers
```bash
# From root directory
pnpm dev
```

This will start:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

### 3. Test the Setup

**Backend Health Check:**
```bash
curl http://localhost:5000/health
```

**Frontend:**
- Open http://localhost:3000 in your browser
- You should see the PathoGen landing page

---

## ✅ Configuration Checklist

- [ ] Update `DATABASE_URL` with your PostgreSQL credentials
- [ ] Create PostgreSQL database named `pathogen`
- [ ] Set up Gmail App Password
- [ ] Update `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- [ ] Generate and add `ENCRYPTION_KEY`
- [ ] Generate and update `JWT_SECRET`
- [ ] (Optional) Set up Sentry and add `SENTRY_DSN`
- [ ] Run `pnpm db:push` to create database tables
- [ ] Start servers with `pnpm dev`

---

## 📚 Additional Documentation

- **[SENTRY_AND_ENCRYPTION_SETUP.md](./SENTRY_AND_ENCRYPTION_SETUP.md)** - Detailed guide for Sentry and encryption
- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md)** - Phase 1 completion status

---

## 🆘 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready` or check services
- Verify credentials in `DATABASE_URL`
- Ensure database `pathogen` exists

### Email Not Sending
- Verify Gmail App Password (not regular password)
- Check 2-Step Verification is enabled
- Ensure `EMAIL_USER` and `EMAIL_PASSWORD` are correct

### Port Already in Use
- Change `PORT` in backend `.env` (default: 5000)
- Change port in frontend by editing `package.json` scripts

---

## 🎯 Next Steps After Setup

Once everything is configured:
1. ✅ Test login page at http://localhost:3000/login
2. ✅ Implement authentication backend (Phase 1 completion)
3. ✅ Start Phase 2: Disease Analytics Engine

