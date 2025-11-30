# Alternative Push Methods

Since the direct push is failing due to authentication, here are alternative methods:

## Method 1: Manual Upload via GitHub Web Interface

1. Go to: https://github.com/NirmanSilicon/Nirman5.0/tree/main/Cipher7
2. Click "Add file" → "Upload files"
3. Create folder structure: `Cipher7/backend/`
4. Upload all files from `packages/backend/` folder

## Method 2: Use GitHub Desktop or Git GUI

1. Clone the repository: `git clone https://github.com/NirmanSilicon/Nirman5.0.git`
2. Copy `packages/backend` to `Cipher7/backend` in the cloned repo
3. Commit and push using GitHub Desktop

## Method 3: Create a Pull Request from Fork

1. Fork the repository to your account
2. Push backend folder to your fork
3. Create a pull request to merge into main

## Method 4: Use Correct Token

The token must be from the **NirmanSilicon** GitHub account, not Subhasishpanda1777.

To get the correct token:
1. Log in as NirmanSilicon on GitHub
2. Go to: https://github.com/settings/tokens
3. Generate new token with `repo` scope
4. Use that token in the remote URL

## Current Issue

- Token belongs to: `Subhasishpanda1777`
- Repository owner: `NirmanSilicon`
- Solution: Need token from NirmanSilicon account OR write access granted


