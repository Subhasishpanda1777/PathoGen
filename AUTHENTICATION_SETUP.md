# 🔐 Authentication System Setup

## ✅ What's Been Implemented

The complete authentication system has been implemented with:

1. **Email Service** - Sends OTP via Gmail
2. **OTP Management** - Generates, stores, and validates OTP codes
3. **Password Hashing** - Uses bcrypt for secure password storage
4. **JWT Tokens** - Generates and verifies authentication tokens
5. **Authentication Routes** - Complete API endpoints for auth flow
6. **Auth Middleware** - Protects routes and validates tokens

---

## 📝 API Endpoints

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please verify your email with OTP.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### 2. Login (Send OTP)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email. Please verify to complete login."
}
```

---

### 3. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isVerified": true
  }
}
```

---

### 4. Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP resent to your email"
}
```

---

### 5. Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isVerified": true
  }
}
```

---

## 🔄 Authentication Flow

### Registration Flow:
1. User submits email and password → `POST /api/auth/register`
2. System creates user account (unverified)
3. User needs to verify email (can use OTP later)

### Login Flow:
1. User submits email and password → `POST /api/auth/login`
2. System verifies password
3. System generates and sends OTP via email
4. User submits OTP → `POST /api/auth/verify-otp`
5. System validates OTP and returns JWT token
6. User uses JWT token in `Authorization: Bearer <token>` header

---

## 🛠️ Required Environment Variables

Make sure these are set in `packages/backend/.env`:

```env
# Email Configuration (for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# JWT Secret
JWT_SECRET=your-secret-key-32-characters-minimum
```

---

## 📦 New Dependencies Added

The following packages were added:
- `nodemailer` - For sending emails
- `@types/nodemailer` - TypeScript types

**Install dependencies:**
```bash
cd packages/backend
pnpm install
```

---

## 🔧 Email Configuration

### Gmail App Password Setup:

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" → "Other (Custom name)"
   - Enter "PathoGen"
   - Copy the 16-character password

3. **Add to .env:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # 16 chars, no spaces
   ```

---

## 🧪 Testing the Authentication

### 1. Test Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Check Email for OTP

### 4. Test OTP Verification:
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### 5. Test Protected Route:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 🔒 Security Features

1. **Password Hashing** - Uses bcrypt with 10 salt rounds
2. **OTP Expiration** - OTPs expire after 10 minutes
3. **OTP One-Time Use** - OTPs are marked as used after verification
4. **JWT Tokens** - Secure token-based authentication
5. **Email Validation** - Validates email format
6. **Rate Limiting** - Can be added (recommended for production)

---

## 📝 Frontend Integration

Update your login page (`packages/frontend/app/(auth)/login/page.tsx`) to connect to these endpoints:

1. **On email/password submit:**
   - Call `POST /api/auth/login`
   - Show OTP input if successful

2. **On OTP submit:**
   - Call `POST /api/auth/verify-otp`
   - Store JWT token in localStorage or cookie
   - Redirect to dashboard

3. **For protected routes:**
   - Include `Authorization: Bearer <token>` header
   - Use `/api/auth/me` to verify token and get user info

---

## ✅ Next Steps

1. **Install new dependencies:**
   ```bash
   cd packages/backend
   pnpm install
   ```

2. **Configure email settings** in `.env`

3. **Push database schema** (if not done):
   ```bash
   pnpm db:push
   ```

4. **Test the endpoints** using curl or Postman

5. **Update frontend** to integrate with these APIs

---

## 🐛 Troubleshooting

### Email Not Sending:
- Check Gmail App Password is correct
- Verify 2-Step Verification is enabled
- Check email credentials in `.env`

### OTP Not Working:
- Check database connection
- Verify OTP table exists (`pnpm db:push`)
- Check server logs for errors

### JWT Token Issues:
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration time
- Ensure token is sent in `Authorization: Bearer <token>` header

---

## 📚 Files Created

- `src/services/email.service.ts` - Email sending service
- `src/utils/otp.utils.ts` - OTP generation and validation
- `src/utils/password.utils.ts` - Password hashing
- `src/utils/jwt.utils.ts` - JWT token management
- `src/middleware/auth.middleware.ts` - Authentication middleware
- `src/routes/auth.routes.ts` - Authentication API routes

---

The authentication system is now complete and ready to use! 🎉

