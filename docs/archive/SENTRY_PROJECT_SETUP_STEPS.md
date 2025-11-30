# 📊 Sentry Project Setup - Step-by-Step Guide

## Based on Your Sentry Interface

Looking at your Sentry project creation screen, here's exactly what to fill in:

---

## Section 2: Set Your Alert Frequency

### Alert Options:
1. ✅ **Select: "Alert me on high priority issues"** (This is already selected - good!)
   - This will notify you for important errors

2. **Optional:** "Notify via email" ✅ (Already checked - keep it checked)
   - This ensures you get email notifications

3. **Optional:** "Connect to messaging" (Slack, Discord, Teams)
   - You can skip this for now, or connect later

---

## Section 3: Name Your Project and Assign It to a Team

### Project Slug:
**What to enter:** `pathogen-backend` or `pathogen-backend-api`

**Current value:** It shows `node` (from Node.js platform selection)

**Change it to:**
- `pathogen-backend` (recommended)
- Or: `pathogen-api`
- Or: `pathogen`

This is the unique identifier for your project in Sentry.

---

### Team:
**What to select:** Keep your existing team (shows `#cipher7`)

**Current value:** `#cipher7` (Your existing team)

**Action:** Leave this as is, or select your preferred team if you have multiple teams.

---

### Create Project Button:
**Action:** Click the purple **"Create Project"** button

---

## After Clicking "Create Project"

Once you create the project, Sentry will show you the setup page with:

### **Your Sentry DSN** - This is what you need!

The DSN will look something like:
```
https://abc123def456@o1234567.ingest.sentry.io/1234567
```

It will be displayed in a section like:
- **"Client Keys (DSN)"**
- Or in the code snippet on the setup page

---

## Complete Setup Flow:

1. ✅ **Platform:** Node.js (already selected)

2. ✅ **Alert Settings:**
   - ✅ "Alert me on high priority issues" (selected)
   - ✅ "Notify via email" (checked)

3. ✅ **Project Slug:** Change `node` to `pathogen-backend`

4. ✅ **Team:** Keep `#cipher7` (or select your team)

5. ✅ **Click:** "Create Project" button

6. ✅ **Copy DSN:** After creation, copy the DSN URL

7. ✅ **Add to .env files:**
   - Backend: `SENTRY_DSN=https://...`
   - Frontend: `NEXT_PUBLIC_SENTRY_DSN=https://...`

---

## What Your Settings Should Look Like:

```
Section 2: Set your alert frequency
  ✅ Alert me on high priority issues
  ✅ Notify via email

Section 3: Name your project and assign it a team
  Project slug: pathogen-backend
  Team: #cipher7
  
  [Create Project] ← Click this button
```

---

## After Project Creation:

Once you click "Create Project", you'll see:

1. **Setup Instructions Page** - Shows code snippets
2. **DSN Configuration** - Your DSN key will be visible
3. **Quick Start Guide** - You can skip this for now

**What you need:** Copy the DSN URL (starts with `https://`) and add it to your `.env` files.

---

## Quick Reference:

**Project Slug:** `pathogen-backend`  
**Team:** `#cipher7` (your existing team)  
**Alerts:** High priority issues + Email notifications  
**Action:** Click "Create Project"

---

## Need Help Finding the DSN After Creation?

If you can't find the DSN immediately:
1. Go to your Sentry Dashboard
2. Click on the project you just created (`pathogen-backend`)
3. Go to **Settings** → **Projects** → `pathogen-backend`
4. Click on **"Client Keys (DSN)"** in the left sidebar
5. Copy the DSN URL shown there

---

That's it! Once you have the DSN, add it to your `.env` files as mentioned in the previous guide.

