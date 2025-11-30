# 🧪 API Testing Guide - Phase 2 Endpoints

Complete guide for testing all new Phase 2 API endpoints.

---

## 📋 Phase 2 Endpoints

### 🔬 Symptoms Routes

#### 1. Submit Symptom Report

**POST** `/api/symptoms/report`

**Description:** Submit a symptom report (anonymous or authenticated)

**Request Body:**
```json
{
  "email": "user@example.com",
  "symptoms": ["fever", "cough", "headache"],
  "duration": 5,
  "severity": "Moderate",
  "location": {
    "state": "Delhi",
    "district": "Central Delhi",
    "city": "New Delhi",
    "coordinates": {
      "latitude": 28.6139,
      "longitude": 77.2090
    }
  },
  "description": "Feeling unwell for the past few days",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response (201 Created):**
```json
{
  "message": "Thank you! Your report will be reviewed and contribute to community health.",
  "report": {
    "id": "uuid-here",
    "status": "pending",
    "createdAt": "2025-11-25T..."
  }
}
```

**PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    symptoms = @("fever", "cough")
    duration = 5
    severity = "Moderate"
    location = @{
        state = "Delhi"
        district = "Central Delhi"
        city = "New Delhi"
    }
    description = "Test report"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/symptoms/report" -Method POST -Body $body -ContentType "application/json"
```

---

#### 2. Get Symptom Reports (Protected)

**GET** `/api/symptoms/reports`

**Description:** Get symptom reports (users see their own, admins see all)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, verified, rejected)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "reports": [
    {
      "id": "uuid",
      "symptoms": ["fever", "cough"],
      "duration": 5,
      "severity": "Moderate",
      "location": {...},
      "status": "pending",
      "isVerified": false,
      "createdAt": "..."
    }
  ]
}
```

**PowerShell:**
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/symptoms/reports" -Method GET -Headers $headers
```

---

#### 3. Verify Report (Admin Only)

**PUT** `/api/symptoms/reports/:id/verify`

**Description:** Verify or reject a symptom report (admin only)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "status": "verified"
}
```

**Response (200 OK):**
```json
{
  "message": "Report verified successfully",
  "report": {
    "id": "uuid",
    "status": "verified",
    "isVerified": true
  }
}
```

---

### 📊 Dashboard Routes

#### 1. Get Dashboard Stats

**GET** `/api/dashboard/stats`

**Description:** Get overall dashboard statistics

**Response (200 OK):**
```json
{
  "stats": {
    "activeOutbreaks": 5,
    "recentReports": 42,
    "trendingDiseasesCount": 3
  }
}
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/stats" -Method GET
```

---

#### 2. Get Trending Diseases

**GET** `/api/dashboard/trending-diseases`

**Query Parameters:**
- `state` (optional): Filter by state
- `limit` (optional): Number of results (default: 10)

**Response (200 OK):**
```json
{
  "trending": [
    {
      "diseaseId": "uuid",
      "name": "Dengue",
      "caseCount": 1250,
      "trend": "rising",
      "trendPercentage": 12.5,
      "riskLevel": "high"
    }
  ]
}
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/trending-diseases" -Method GET
```

---

#### 3. Get Infection Index

**GET** `/api/dashboard/infection-index`

**Query Parameters:**
- `state` (optional): Filter by state
- `weeks` (optional): Number of weeks (default: 8)

**Response (200 OK):**
```json
{
  "infectionIndex": [
    {
      "week": "2024-W01",
      "weekStartDate": "...",
      "weekEndDate": "...",
      "indexValue": 65.5,
      "totalReports": 120,
      "state": "Delhi",
      "district": "Central Delhi"
    }
  ]
}
```

---

#### 4. Get Health Risk Score (Protected)

**GET** `/api/dashboard/health-risk-score`

**Description:** Get current user's health risk score

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "score": 45,
  "riskLevel": "medium",
  "factors": {
    "location": "Delhi",
    "regionalData": {...},
    "symptoms": [...]
  },
  "calculatedAt": "...",
  "week": "2024-W01"
}
```

---

#### 5. Get Heatmap Data

**GET** `/api/dashboard/heatmap-data`

**Description:** Get data for India heatmap visualization

**Response (200 OK):**
```json
{
  "heatmap": [
    {
      "state": "Delhi",
      "riskLevel": "high",
      "totalCases": 1250,
      "activeCases": 800,
      "outbreakCount": 3
    }
  ]
}
```

---

## 🧪 Complete Test Flow

### 1. Submit Symptom Report (Anonymous)
```powershell
$body = @{
    email = "anonymous@example.com"
    symptoms = @("fever", "cough", "fatigue")
    duration = 7
    severity = "Moderate"
    location = @{
        state = "Maharashtra"
        district = "Mumbai"
        city = "Mumbai"
    }
} | ConvertTo-Json -Depth 3

$report = Invoke-RestMethod -Uri "http://localhost:5000/api/symptoms/report" -Method POST -Body $body -ContentType "application/json"
Write-Host "Report ID: $($report.report.id)"
```

### 2. Get Dashboard Stats
```powershell
$stats = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/stats" -Method GET
Write-Host "Active Outbreaks: $($stats.stats.activeOutbreaks)"
```

### 3. Get Trending Diseases
```powershell
$trending = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/trending-diseases?state=Delhi" -Method GET
$trending.trending | Format-Table
```

---

## 📝 Postman Collection

All Phase 2 endpoints are ready for Postman testing:

- Symptoms: `/api/symptoms/*`
- Dashboard: `/api/dashboard/*`

---

## ✅ Test Results

All Phase 2 endpoints tested and working:
- ✅ Symptom report submission
- ✅ Dashboard stats
- ✅ Trending diseases
- ✅ Infection index
- ✅ Heatmap data

---

**Phase 2 endpoints are ready for use! 🚀**

