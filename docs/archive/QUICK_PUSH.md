# Quick Push Command

## Step 1: Get Your GitHub Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select `repo` scope
4. Copy the token

## Step 2: Set Remote with Token
Run this command (replace `YOUR_TOKEN` with your actual token):

```powershell
git remote set-url cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git
```

## Step 3: Push
Run this command:

```powershell
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
```

## All-in-One Command (After getting token)
```powershell
# Replace YOUR_TOKEN with your GitHub Personal Access Token
git remote set-url cipher7 https://YOUR_TOKEN@github.com/NirmanSilicon/Nirman5.0.git
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
```

