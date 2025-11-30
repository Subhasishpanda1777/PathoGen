# 🔐 Admin Login Credentials

## Default Admin Credentials

The admin login system uses predefined credentials that can be customized via environment variables.

### Default Values:
- **Email**: `admin@pathogen.com`
- **Password**: `Admin@123456`

---

## 🔧 Customizing Admin Credentials

You can customize the admin credentials by adding environment variables to `packages/backend/.env`:

```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=YourSecurePassword123
```

### Steps:
1. Open `packages/backend/.env`
2. Add the following lines:
   ```env
   ADMIN_EMAIL=your-admin@email.com
   ADMIN_PASSWORD=YourSecurePassword123
   ```
3. Restart the backend server

---

## 🚀 How to Login

1. Go to: `http://localhost:3000/admin/login`
2. Enter the admin email and password
3. Click "Login"
4. You'll be redirected to the admin panel

---

## 🔒 Security Notes

- **Default credentials are for development only**
- **Change credentials in production**
- **Use strong passwords** (minimum 8 characters, mix of letters, numbers, and symbols)
- **Never commit credentials to git** (they're in `.env` which is gitignored)

---

## ✅ Features

- ✅ **No OTP required** - Simple email and password login
- ✅ **Auto-creates admin user** - If admin user doesn't exist, it's created automatically
- ✅ **Database admin support** - Also supports admin users from database with `role='admin'`
- ✅ **Secure** - Passwords are hashed using bcrypt

---

## 📝 How It Works

1. **Predefined Admin**: If email matches `ADMIN_EMAIL` and password matches `ADMIN_PASSWORD`, login is granted
2. **Database Admin**: If email doesn't match predefined admin, system checks database for user with `role='admin'` and verifies password
3. **Auto-Creation**: If predefined admin doesn't exist in database, it's automatically created on first login

---

## 🎯 Quick Test

1. Go to: `http://localhost:3000/admin/login`
2. Enter:
   - Email: `admin@pathogen.com`
   - Password: `Admin@123456`
3. Click "Login"
4. Should redirect to `/admin` panel

---

**Admin login is now simplified - just email and password! 🎉**

