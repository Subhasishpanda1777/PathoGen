# 🔐 How to Set Admin User

## Quick Method: Using SQL (Recommended)

### Step 1: Open pgAdmin
1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Select the **`pathogen`** database
4. Right-click → **Query Tool**

### Step 2: Run SQL Query

**Option A: Set specific user by email**
```sql
UPDATE users 
SET role = 'admin', updated_at = NOW() 
WHERE email = 'your-email@example.com';
```

**Option B: Set first user in database**
```sql
UPDATE users 
SET role = 'admin', updated_at = NOW() 
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);
```

### Step 3: Verify
```sql
SELECT email, name, role FROM users WHERE role = 'admin';
```

### Step 4: Access Admin Panel
1. **Logout** from the application
2. **Login again** with your admin account
3. Go to: **http://localhost:3000/admin**
4. Or click **"Admin Panel"** in the sidebar

---

## Alternative: Using Script

If you prefer using a script, you can use:

```bash
cd packages/backend
node scripts/set-admin.js your-email@example.com
```

---

## 📁 Admin Panel Structure

The admin panel is now in a separate folder:
- **Location**: `packages/frontend/src/admin/`
- **Component**: `AdminPanel.jsx`
- **Styles**: `admin/styles/admin-panel.css`
- **Route**: `/admin`

---

## ✅ What's New

1. ✅ **Separate Admin Folder** - Admin panel is now in its own dedicated folder
2. ✅ **Dedicated Route** - `/admin` route for admin panel
3. ✅ **Enhanced Features** - Status filtering, better UI
4. ✅ **Better Organization** - Clean separation from user reports

---

## 🎯 Admin Panel Features

- View all symptom reports
- Filter by status (All, Pending, Verified, Rejected)
- Approve/Reject reports
- Preview attached files
- See user information for each report

---

## 🚨 Important Notes

- You must **logout and login again** after setting admin role
- Admin panel is only accessible at `/admin` route
- Regular users see "My Reports" at `/dashboard/reports`
- Admin users see both "Admin Panel" and "My Reports" in sidebar

