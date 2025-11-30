# Guide: Push Backend Folder to Cipher7

## Target Repository
- **Repository**: https://github.com/NirmanSilicon/Nirman5.0
- **Target Path**: `Cipher7/backend`
- **Full URL**: https://github.com/NirmanSilicon/Nirman5.0/tree/main/Cipher7/backend

## Quick Push (After Authentication)

```powershell
.\push-backend-only.ps1
```

## Authentication Setup

### Method 1: Personal Access Token (Easiest)

1. **Create Token:**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "Cipher7 Backend Push"
   - Expiration: Choose your preference (90 days recommended)
   - Scopes: Check `repo` (Full control of private repositories)
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately (you won't see it again!)

2. **Update Git Remote:**
   ```powershell
   git remote set-url cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git
   ```
   Replace `YOUR_TOKEN` with the token you just copied.

3. **Verify:**
   ```powershell
   git remote -v
   ```
   Should show: `cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git`

4. **Push:**
   ```powershell
   .\push-backend-only.ps1
   ```

### Method 2: SSH Key

1. **Check for existing SSH key:**
   ```powershell
   ls ~/.ssh
   ```

2. **Generate SSH key (if needed):**
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. **Add SSH key to GitHub:**
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your key and save

4. **Update remote:**
   ```powershell
   git remote set-url cipher7 git@github.com:NirmanSilicon/Nirman5.0.git
   ```

5. **Test connection:**
   ```powershell
   ssh -T git@github.com
   ```

6. **Push:**
   ```powershell
   .\push-backend-only.ps1
   ```

## Manual Push Command

If you prefer to push manually:

```powershell
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
```

## What Gets Pushed

Only the `packages/backend` folder will be pushed to `Cipher7/backend` in the target repository.

**Includes:**
- All backend source code (`src/`)
- Configuration files (`.env.example`, `drizzle.config.ts`, etc.)
- Scripts (`scripts/`)
- Package files (`package.json`, `tsconfig.json`, etc.)

**Excludes:**
- `node_modules/` (already in `.gitignore`)
- `.env` files (sensitive data)
- Build artifacts

## Verification

After successful push, verify at:
https://github.com/NirmanSilicon/Nirman5.0/tree/main/Cipher7/backend

## Troubleshooting

### Error: "Permission denied (403)"
- **Solution**: Set up authentication (see above)

### Error: "Repository not found"
- **Solution**: Verify you have access to the repository
- Check: https://github.com/NirmanSilicon/Nirman5.0

### Error: "Branch not found"
- **Solution**: The target repository might use a different branch name
- Try: `git subtree push --prefix=packages/backend cipher7 master:Cipher7/backend`

### Error: "Subtree push failed"
- **Solution**: Make sure you're in the repository root directory
- Run: `cd D:\PathoGen` before pushing

