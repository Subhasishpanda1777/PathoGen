# Normal Push Without Token (Browser Authentication)

## Method 1: Use GitHub Desktop (Easiest)

1. **Install GitHub Desktop** (if not installed):
   - Download from: https://desktop.github.com/

2. **Clone the repository**:
   - Open GitHub Desktop
   - File → Clone repository
   - URL: `https://github.com/NirmanSilicon/Nirman5.0.git`
   - Choose local path
   - Click Clone

3. **Copy backend folder**:
   - Copy `packages/backend` from your project
   - Paste it as `Cipher7/backend` in the cloned repository

4. **Commit and Push**:
   - GitHub Desktop will prompt you to authenticate
   - Sign in with your GitHub account
   - Commit the changes
   - Push to origin

## Method 2: Use Windows Credential Manager

1. **Clear old credentials**:
   ```powershell
   cmdkey /list | Select-String "github"
   # Delete if found:
   cmdkey /delete:git:https://github.com
   ```

2. **Push (will prompt for credentials)**:
   ```powershell
   git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
   ```

3. **When prompted**:
   - Username: Your GitHub username
   - Password: Use a Personal Access Token (not your account password)
   - Get token from: https://github.com/settings/tokens

## Method 3: Use Git Credential Manager

Git Credential Manager will open a browser for authentication:

```powershell
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
```

If Git Credential Manager is installed, it will:
1. Open your browser
2. Ask you to sign in to GitHub
3. Authorize the access
4. Complete the push

## Method 4: Manual Upload (No Git Required)

1. Go to: https://github.com/NirmanSilicon/Nirman5.0/tree/main/Cipher7
2. Click "Add file" → "Upload files"
3. Create `backend` folder
4. Upload all files from `packages/backend`

## Current Remote

The remote is set to: `https://github.com/NirmanSilicon/Nirman5.0.git`

Try pushing now - it should prompt for authentication:
```powershell
git subtree push --prefix=packages/backend cipher7 main:Cipher7/backend
```


