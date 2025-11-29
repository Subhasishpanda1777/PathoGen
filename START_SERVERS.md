# 🚀 Starting PathoGen Servers

## Quick Start Guide

### Option 1: Start Both Servers (Recommended)

Open **TWO separate terminal windows** and run:

#### Terminal 1 - Backend Server:
```bash
cd packages/backend
pnpm dev
```
**Backend will start on**: http://localhost:5000

#### Terminal 2 - Frontend Server:
```bash
cd packages/frontend
pnpm dev
```
**Frontend will start on**: http://localhost:3000

---

### Option 2: Using Root Script (If Available)

From project root:
```bash
pnpm dev
```

This should start both servers in parallel (if configured).

---

## Verification Steps

### 1. Check Backend Health

Open browser or use curl:
```bash
# Browser
http://localhost:5000/health

# PowerShell
Invoke-RestMethod -Uri http://localhost:5000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "PathoGen API Server is running",
  "timestamp": "2024-..."
}
```

### 2. Check Frontend

Open browser:
```
http://localhost:3000
```

You should see the PathoGen landing page.

### 3. Test API Integration

Open browser console on frontend (F12) and check:
- No CORS errors
- API calls working
- Data loading successfully

---

## Troubleshooting

### Backend Not Starting

1. **Check Port 5000 is Available**:
   ```powershell
   netstat -ano | findstr :5000
   ```

2. **Check Database Connection**:
   - Ensure PostgreSQL is running
   - Check `.env` file has correct database credentials

3. **Check Dependencies**:
   ```bash
   cd packages/backend
   pnpm install
   ```

### Frontend Not Starting

1. **Check Port 3000 is Available**:
   ```powershell
   netstat -ano | findstr :3000
   ```

2. **Check Dependencies**:
   ```bash
   cd packages/frontend
   pnpm install
   ```

3. **Clear Next.js Cache**:
   ```bash
   rm -rf .next
   pnpm dev
   ```

### API Connection Issues

1. **Check Backend is Running**:
   - Verify http://localhost:5000/health responds

2. **Check CORS Configuration**:
   - Backend should allow `http://localhost:3000`
   - Check `FRONTEND_URL` in backend `.env`

3. **Check Environment Variables**:
   - Frontend: `NEXT_PUBLIC_API_URL=http://localhost:5000`
   - Backend: `FRONTEND_URL=http://localhost:3000`

---

## Server URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Info**: http://localhost:5000/api

---

## Next Steps After Starting

1. ✅ Verify both servers are running
2. ✅ Test health endpoint
3. ✅ Open frontend in browser
4. ✅ Test login/registration
5. ✅ Test dashboard data loading
6. ✅ Test symptom reporting

---

**Servers are starting in the background. Check the terminal output for any errors!**

