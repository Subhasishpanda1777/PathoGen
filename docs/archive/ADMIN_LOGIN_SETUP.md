# 🔐 Admin Login System - Complete Setup

## ✅ What's Been Created

### 1. **Backend Admin Routes**
- **File**: `packages/backend/src/routes/admin.routes.ts`
- **Endpoints**:
  - `POST /api/admin/login` - Admin login with email and password, sends OTP
  - `POST /api/admin/verify-otp` - Verify OTP and complete admin login

### 2. **Frontend Admin Login Page**
- **File**: `packages/frontend/src/admin/AdminLogin.jsx`
- **Route**: `/admin/login`
- **Features**:
  - Email and password input
  - OTP verification
  - Separate from regular user login
  - Admin-specific styling

### 3. **API Integration**
- **File**: `packages/frontend/src/utils/api.js`
- **Methods**:
  - `adminAPI.login(data)` - Admin login
  - `adminAPI.verifyOTP(data)` - Verify admin OTP

---

## 🔐 How Admin Login Works

### Step 1: Admin Login
1. Admin goes to: `http://localhost:3000/admin/login`
2. Enters **email** and **password**
3. Clicks "Send OTP"
4. Backend verifies:
   - User exists
   - User has `role = 'admin'`
   - Password is correct
5. OTP is sent to admin's email

### Step 2: OTP Verification
1. Admin enters 6-digit OTP
2. Backend verifies:
   - OTP is valid
   - OTP is not expired
   - User still has admin role
3. JWT token is generated
4. Admin is redirected to `/admin` panel

---

## 🛡️ Security Features

1. **Role Verification**: Only users with `role = 'admin'` can login
2. **Password Verification**: Password is checked before sending OTP
3. **OTP Expiration**: OTP expires after 10 minutes
4. **Double Check**: Admin role is verified again during OTP verification
5. **Separate Routes**: Admin login is completely separate from user login

---

## 📍 Routes

### Admin Routes:
- `/admin/login` - Admin login page
- `/admin` - Admin panel (protected, requires admin login)

### User Routes:
- `/login` - Regular user login
- `/dashboard` - User dashboard

---

## 🚀 Usage

### For Admins:
1. Go to: `http://localhost:3000/admin/login`
2. Enter admin email and password
3. Receive OTP via email
4. Enter OTP to complete login
5. Access admin panel at `/admin`

### For Regular Users:
- Continue using `/login` for regular user login
- Admin login is completely separate

---

## 🔄 Flow Diagram

```
Admin Login Flow:
1. Admin → /admin/login
2. Enter email + password
3. POST /api/admin/login
   - Verify user exists
   - Verify role = 'admin'
   - Verify password
   - Send OTP
4. Enter OTP
5. POST /api/admin/verify-otp
   - Verify OTP
   - Verify role = 'admin' (again)
   - Generate JWT token
6. Redirect to /admin
```

---

## 🎯 Key Differences from User Login

| Feature | User Login | Admin Login |
|---------|-----------|------------|
| Route | `/login` | `/admin/login` |
| API Endpoint | `/api/auth/login` | `/api/admin/login` |
| Role Check | No | Yes (must be admin) |
| Redirect After Login | `/dashboard` | `/admin` |
| Styling | Regular | Admin-specific |

---

## ✅ Testing

1. **Set a user as admin** (if not already):
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

2. **Test Admin Login**:
   - Go to: `http://localhost:3000/admin/login`
   - Enter admin email and password
   - Check email for OTP
   - Enter OTP
   - Should redirect to `/admin`

3. **Test Non-Admin Access**:
   - Try to login with non-admin account
   - Should show: "Access denied. Admin privileges required."

---

## 📝 Notes

- Admin login requires both password AND OTP verification
- Admin role is checked twice (during login and OTP verification)
- Regular users cannot access admin login endpoints
- Admin panel redirects to `/admin/login` if not authenticated
- All admin actions are logged and monitored

---

**Admin login system is now complete and ready to use! 🎉**

