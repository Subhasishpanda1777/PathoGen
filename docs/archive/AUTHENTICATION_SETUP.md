# GitHub Authentication Setup for Cipher7 Push

## Current Issue
The push is failing because you need to authenticate with GitHub to push to `NirmanSilicon/Nirman5.0` repository.

## Solution Options

### Option 1: Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name it: "Cipher7 Push Token"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Update Git Remote with Token:**
   ```powershell
   # Replace YOUR_TOKEN with the token you just created
   git remote set-url cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git
   ```

3. **Verify the remote:**
   ```powershell
   git remote -v
   ```

4. **Now push:**
   ```powershell
   git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
   git subtree push --prefix="locaton json" cipher7 main:Cipher7/locaton-json
   ```

### Option 2: SSH Key

1. **Check if you have SSH keys:**
   ```powershell
   ls ~/.ssh
   ```

2. **If no SSH key exists, generate one:**
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. **Add SSH key to GitHub:**
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your key and save

4. **Update remote to use SSH:**
   ```powershell
   git remote set-url cipher7 git@github.com:NirmanSilicon/Nirman5.0.git
   ```

5. **Test SSH connection:**
   ```powershell
   ssh -T git@github.com
   ```

### Option 3: GitHub CLI (gh)

If you have GitHub CLI installed:
```powershell
gh auth login
# Follow the prompts to authenticate
```

## Quick Push After Authentication

Once authenticated, run:
```powershell
.\push-to-cipher7.ps1
```

Or manually:
```powershell
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
git subtree push --prefix="locaton json" cipher7 main:Cipher7/locaton-json
```

## Alternative: Manual Upload via GitHub Web

If git push continues to fail:

1. Go to: https://github.com/NirmanSilicon/Nirman5.0/tree/main/Cipher7
2. Click "Add file" → "Upload files"
3. Create folders: `backend` and `locaton-json`
4. Upload the files manually
