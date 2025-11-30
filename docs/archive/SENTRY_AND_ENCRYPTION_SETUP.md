# 🔐 Sentry DSN & Encryption Key Setup Guide

## 📊 How to Get Sentry DSN (Optional but Recommended)

Sentry is used for error monitoring and tracking. It's optional but highly recommended for production.

### Step 1: Create a Sentry Account
1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (or log in if you already have one)

### Step 2: Create a New Project
1. After logging in, click **"Create Project"** or go to your dashboard
2. Select **"Node.js"** as your platform
3. Give your project a name (e.g., "PathoGen Backend")
4. Click **"Create Project"**

### Step 3: Get Your DSN
1. After creating the project, you'll see a setup page
2. Look for **"Client Keys (DSN)"** section
3. Copy the DSN URL - it looks like:
   ```
   https://abc123def456@o1234567.ingest.sentry.io/1234567
   ```

### Step 4: Add to .env File
Add the DSN to your `packages/backend/.env`:
```env
SENTRY_DSN=https://abc123def456@o1234567.ingest.sentry.io/1234567
```

And for frontend in `packages/frontend/.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@o1234567.ingest.sentry.io/1234567
```

**Note:** You can use the same DSN for both, or create separate projects for frontend and backend.

### Step 5: Test Sentry (Optional)
Sentry will automatically start tracking errors once configured. You can test it by intentionally causing an error in your application.

---

## 🔑 How to Generate Encryption Key

The encryption key is used for AES-256 encryption of sensitive data. It must be exactly 32 bytes (256 bits).

### Method 1: Using Node.js Script (Recommended)

Run the provided script:
```bash
cd packages/backend
node scripts/generate-encryption-key.js
```

This will generate a secure random key and display it.

### Method 2: Using Node.js Command Line

```bash
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('base64'))"
```

### Method 3: Using OpenSSL (if installed)

```bash
openssl rand -base64 32
```

### Method 4: Using PowerShell (Windows)

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

### Add to .env File

Copy the generated key and add it to `packages/backend/.env`:
```env
ENCRYPTION_KEY=your-generated-base64-key-here-32-characters-minimum
```

**Important Security Notes:**
- ⚠️ **Never commit the encryption key to git** (it's already in `.gitignore`)
- ⚠️ **Use different keys for development and production**
- ⚠️ **Store production keys securely** (use environment variables or secret management services)
- ⚠️ **If you lose the key, encrypted data cannot be decrypted**

---

## 📝 Updated .env Configuration

Based on your requirements:
- ✅ Using local PostgreSQL database
- ✅ Using email (Gmail) for sending OTP (not Google OAuth)
- ⏳ Sentry DSN (optional - get from sentry.io)
- ⏳ Encryption Key (generate using methods above)

### Backend .env Template

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database Configuration (Local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/pathogen

# JWT Secret (change this to a secure random string)
JWT_SECRET=pathogen-dev-secret-key-change-in-production-min-32-chars

# Email Configuration (Gmail for sending OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Sentry (Error Monitoring - Optional)
# Get from: https://sentry.io → Create Project → Copy DSN
SENTRY_DSN=

# Encryption Key (Generate using: node scripts/generate-encryption-key.js)
ENCRYPTION_KEY=
```

### Frontend .env.local Template

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Sentry (Error Monitoring - Optional)
# Get from: https://sentry.io → Create Project → Copy DSN
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 🔧 Gmail App Password Setup

Since you're using Gmail to send OTP emails, you need to create an **App Password** (not your regular Gmail password):

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **"Mail"** and **"Other (Custom name)"**
3. Enter "PathoGen" as the name
4. Click **"Generate"**
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Add to .env
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Remove spaces from app password
```

**Note:** Use the app password (not your regular Gmail password) in the `.env` file.

---

## ✅ Quick Setup Checklist

- [ ] Generate encryption key using `node scripts/generate-encryption-key.js`
- [ ] Add encryption key to `packages/backend/.env`
- [ ] (Optional) Create Sentry account and get DSN
- [ ] (Optional) Add Sentry DSN to both `.env` files
- [ ] Set up Gmail App Password
- [ ] Add Gmail credentials to `packages/backend/.env`
- [ ] Update `DATABASE_URL` with your PostgreSQL credentials
- [ ] Update `JWT_SECRET` with a secure random string

---

## 🚀 After Setup

Once all environment variables are configured:

1. **Push database schema:**
   ```bash
   cd packages/backend
   pnpm db:push
   ```

2. **Start development servers:**
   ```bash
   # From root directory
   pnpm dev
   ```

Your application will now be configured with:
- ✅ Local PostgreSQL database
- ✅ Email-based OTP system (Gmail)
- ✅ Error monitoring (if Sentry configured)
- ✅ Data encryption (if encryption key set)

