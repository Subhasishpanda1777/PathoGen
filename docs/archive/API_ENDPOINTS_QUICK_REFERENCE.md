# 🚀 API Endpoints - Quick Reference

## Base URL
```
http://localhost:5000
```

---

## 📋 All Endpoints

### 🔧 System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api` | API information |

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and send OTP | No |
| POST | `/api/auth/verify-otp` | Verify OTP, get token | No |
| POST | `/api/auth/resend-otp` | Resend OTP | No |
| GET | `/api/auth/me` | Get current user | Yes |

---

## 🔗 Direct Links

### System:
- [Health Check](http://localhost:5000/health)
- [API Info](http://localhost:5000/api)

### Authentication:
- [Register](http://localhost:5000/api/auth/register) - POST only
- [Login](http://localhost:5000/api/auth/login) - POST only
- [Verify OTP](http://localhost:5000/api/auth/verify-otp) - POST only
- [Resend OTP](http://localhost:5000/api/auth/resend-otp) - POST only
- [Get Current User](http://localhost:5000/api/auth/me) - GET with Bearer token

---

## 📝 Request Examples

### 1. Register
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### 2. Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Verify OTP
```json
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### 4. Resend OTP
```json
POST /api/auth/resend-otp
{
  "email": "user@example.com"
}
```

### 5. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

---

## 🧪 Quick Test Commands

### PowerShell One-Liners:

**Health Check:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

**Register:**
```powershell
$body = @{email="test@test.com";password="test123";name="Test"} | ConvertTo-Json; Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Login:**
```powershell
$body = @{email="test@test.com";password="test123"} | ConvertTo-Json; Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Verify OTP:**
```powershell
$body = @{email="test@test.com";otp="123456"} | ConvertTo-Json; Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-otp" -Method POST -Body $body -ContentType "application/json"
```

**Get User (with token):**
```powershell
$headers = @{Authorization="Bearer YOUR_TOKEN_HERE"}; Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

---

## 📚 Full Documentation

See `API_TESTING_GUIDE.md` for complete testing guide with:
- Detailed request/response examples
- Error handling examples
- Complete test script
- Postman collection

---

**Quick Start:** Run `.\test-api.ps1` for automated testing! 🚀

