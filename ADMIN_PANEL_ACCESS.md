# 🔐 How to Access Admin Panel

## 📍 Admin Panel URL

The admin panel is accessible at:
**http://localhost:3000/dashboard/reports**

## ⚠️ Important Notes

- The admin panel **automatically shows** if your user account has `role = 'admin'`
- If you're a regular user, you'll see "My Reports" instead
- You must be **logged in** to access the reports page

## 🛠️ How to Set a User as Admin

### Method 1: Using the Script (Recommended)

1. **Open terminal** in the project root
2. **Run the script** with your email:
   ```bash
   cd packages/backend
   node scripts/set-admin.js your-email@example.com
   ```

3. **Example:**
   ```bash
   node scripts/set-admin.js admin@pathogen.com
   ```

4. **Logout and login again** to refresh your session

### Method 2: Using pgAdmin (SQL)

1. **Open pgAdmin**
2. **Connect to your database** (`pathogen`)
3. **Open Query Tool**
4. **Run this SQL** (replace with your email):
   ```sql
   UPDATE users 
   SET role = 'admin', updated_at = NOW() 
   WHERE email = 'your-email@example.com';
   ```

5. **Verify** the update:
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```

6. **Logout and login again** to refresh your session

### Method 3: Direct Database Update

If you have direct database access:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## ✅ After Setting Admin Role

1. **Logout** from the application
2. **Login again** with your admin account
3. **Navigate to**: http://localhost:3000/dashboard/reports
4. You should now see the **Admin Panel** with all reports

## 🎯 Admin Panel Features

Once you have admin access, you can:
- ✅ View all symptom reports from all users
- ✅ See user information (name, email) for each report
- ✅ Approve or reject reports
- ✅ Preview attached files (PDF, images)
- ✅ Filter reports by status (pending, verified, rejected)

## 🔍 Verify Your Role

To check if you're an admin:
1. Go to: http://localhost:3000/dashboard/profile
2. Check your profile - it should show your role
3. Or check the sidebar - "Admin Panel" should appear if you're admin

## 🚨 Troubleshooting

**Problem**: Still seeing "My Reports" instead of Admin Panel
- **Solution**: Make sure you logged out and logged back in after setting admin role

**Problem**: "Access Denied" message
- **Solution**: Your user role is not set to 'admin'. Use one of the methods above to set it.

**Problem**: Can't find the script
- **Solution**: Make sure you're in the `packages/backend` directory when running the script

## 📝 Quick Test

After setting admin role:
1. Logout
2. Login
3. Go to: http://localhost:3000/dashboard/reports
4. You should see "Admin - Symptom Reports" heading

