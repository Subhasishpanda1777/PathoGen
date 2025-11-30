# Instructions to Push Backend and locaton json to Cipher7

## Prerequisites

You need to authenticate with GitHub to push to the `NirmanSilicon/Nirman5.0` repository.

### Option 1: Using Personal Access Token (PAT)

1. Create a Personal Access Token in GitHub:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate a new token with `repo` permissions
   - Copy the token

2. Update the remote URL with your token:
   ```powershell
   git remote set-url cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git
   ```

### Option 2: Using SSH

1. Set up SSH keys if not already done
2. Update the remote URL:
   ```powershell
   git remote set-url cipher7 git@github.com:NirmanSilicon/Nirman5.0.git
   ```

## Push Commands

After authentication is set up, run these commands:

### Push Backend Folder
```powershell
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
```

### Push locaton json Folder
```powershell
git subtree push --prefix="locaton json" cipher7 main:Cipher7/locaton-json
```

Or use the provided script:
```powershell
.\push-to-cipher7.ps1
```

## Alternative: Manual Push via GitHub Web Interface

If git subtree doesn't work, you can:

1. Create a new branch in the target repository
2. Manually copy the folders:
   - `packages/backend` → `Cipher7/backend`
   - `locaton json` → `Cipher7/locaton-json`
3. Commit and push via GitHub web interface

## Current Status

- ✅ Remote `cipher7` is configured
- ✅ Backend changes are committed
- ✅ Ready to push (requires authentication)

