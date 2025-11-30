# Push Backend Folder - Quick Guide

## Option 1: Use the Script (Easiest)

Run this command (replace `YOUR_TOKEN` with your GitHub Personal Access Token):

```powershell
.\push-with-token.ps1 -Token "YOUR_TOKEN"
```

## Option 2: Manual Commands

### Step 1: Set Remote with Token
```powershell
git remote set-url cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git
```
(Replace `YOUR_TOKEN` with your actual token)

### Step 2: Push
```powershell
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
```

## Get Your Token

If you don't have a token yet:

1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Cipher7 Push"
4. Check the `repo` box
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

## Security Note

After pushing, you may want to remove the token from the remote URL for security:
```powershell
git remote set-url cipher7 https://github.com/NirmanSilicon/Nirman5.0.git
```

