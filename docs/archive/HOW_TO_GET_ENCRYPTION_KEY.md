# 🔑 How to Get Encryption Key for .env File

## ✅ Method 1: Using the Provided Script (Easiest)

We've already created a script for you. Just run:

```bash
cd packages/backend
node scripts/generate-encryption-key.js
```

**Output Example:**
```
✅ Generated Encryption Key:
==================================================
0t5+1DHm85QmxX1FC9me4y7n9cNlYSNuODMVxLWnpcE=
==================================================

📝 Add this to your .env file:
ENCRYPTION_KEY=0t5+1DHm85QmxX1FC9me4y7n9cNlYSNuODMVxLWnpcE=
```

**Then copy the key and add it to `packages/backend/.env`:**
```env
ENCRYPTION_KEY=0t5+1DHm85QmxX1FC9me4y7n9cNlYSNuODMVxLWnpcE=
```

---

## 🔧 Method 2: Using Node.js Command Line

Run this command from your project root:

```bash
node -e "import('crypto').then(c => console.log('ENCRYPTION_KEY=' + c.default.randomBytes(32).toString('base64')))"
```

This will output:
```
ENCRYPTION_KEY=your-generated-key-here
```

Just copy the entire line and paste it into your `.env` file.

---

## 💻 Method 3: Using PowerShell (Windows)

Open PowerShell and run:

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$key = [Convert]::ToBase64String($bytes)
Write-Host "ENCRYPTION_KEY=$key"
```

---

## 🐧 Method 4: Using OpenSSL (if installed)

If you have OpenSSL installed:

```bash
openssl rand -base64 32
```

---

## 📝 Step-by-Step: Adding to .env File

### 1. Generate the Key

Run from project root:
```bash
cd packages/backend
node scripts/generate-encryption-key.js
```

### 2. Copy the Generated Key

You'll see output like:
```
ENCRYPTION_KEY=0t5+1DHm85QmxX1FC9me4y7n9cNlYSNuODMVxLWnpcE=
```

### 3. Open Your .env File

Open `packages/backend/.env` in your text editor.

### 4. Add the Key

Find the line:
```env
ENCRYPTION_KEY=
```

Replace it with:
```env
ENCRYPTION_KEY=0t5+1DHm85QmxX1FC9me4y7n9cNlYSNuODMVxLWnpcE=
```

**Or just paste the entire line from the script output.**

### 5. Save the File

Save the `.env` file.

---

## ✅ Verification

To verify your encryption key is set correctly, check your `.env` file:

```bash
# On Windows PowerShell
Get-Content packages\backend\.env | Select-String "ENCRYPTION_KEY"
```

You should see:
```
ENCRYPTION_KEY=some-base64-encoded-string
```

---

## ⚠️ Important Security Notes

1. **Never commit the encryption key to git** (it's already in `.gitignore`)
2. **Use different keys for development and production**
3. **Store production keys securely** (environment variables, secret management)
4. **If you lose the key, encrypted data cannot be decrypted**
5. **The key must be exactly 32 bytes** (44 characters when base64 encoded)

---

## 🎯 Quick Command Reference

**Generate key:**
```bash
cd packages/backend && node scripts/generate-encryption-key.js
```

**Copy the output and paste into:**
```
packages/backend/.env
```

That's it! ✅

