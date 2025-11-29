# ✅ Phase 6: Risk Scoring & Alerts - COMPLETE

## 🎉 What's Been Built

### ✅ 1. **Health Risk Score Algorithm**

#### **Service:** `risk-score.service.ts`
- ✅ Comprehensive risk calculation (0-100 scale)
- ✅ Multi-factor scoring:
  - **Location Risk** (0-30 points) - Based on nearby outbreaks
  - **Regional Index** (0-25 points) - Based on infection index
  - **Symptom History** (0-25 points) - Based on user's recent symptoms
  - **Outbreak Proximity** (0-20 points) - Based on distance to outbreaks
- ✅ Risk level classification (Low/Medium/High)
- ✅ Automatic badge awarding
- ✅ Personalized recommendations
- ✅ Weekly tracking and storage

#### **API Integration:**
- ✅ Updated `/api/dashboard/health-risk-score` endpoint
- ✅ Automatically calculates score on request
- ✅ Returns detailed breakdown and recommendations

### ✅ 2. **Email Alerts System**

#### **Service:** `alert.service.ts`
- ✅ **Outbreak Alerts** - Notify users about disease outbreaks in their area
- ✅ **Risk Score Alerts** - Alert users when their risk score is high
- ✅ **Prevention Measures** - Include actionable prevention tips
- ✅ Beautiful HTML email templates
- ✅ Automated alert checking function

#### **Alert Features:**
- ✅ Outbreak alerts with disease name, location, case count
- ✅ Risk score alerts with personalized recommendations
- ✅ Prevention measures included in all alerts
- ✅ Links to dashboard
- ✅ Branded email design

#### **Routes:**
- ✅ `POST /api/alerts/check` - Manually trigger alerts (admin only)

### ✅ 3. **Enhanced Email Service**
- ✅ Generic `sendEmail()` function for alerts
- ✅ HTML email template support
- ✅ Error handling and logging

---

## 📊 Risk Score Calculation Details

### **Scoring Breakdown:**

1. **Location Risk (0-30 points)**
   - Counts high-risk outbreaks in user's state
   - 3 points per high-risk outbreak (max 30)

2. **Regional Infection Index (0-25 points)**
   - Uses weekly infection index for user's state
   - Scales 0-100 index to 0-25 points

3. **Symptom History (0-25 points)**
   - Based on recent symptom reports (last 7 days)
   - Weighted by severity:
     - Severe: 5 points each
     - Moderate: 2 points each
     - Mild: 1 point each
   - Max 25 points

4. **Outbreak Proximity (0-20 points)**
   - High-risk outbreaks in state: 2 points each
   - District-level outbreaks: +3 points each
   - Max 20 points

### **Risk Levels:**
- **Low**: 0-39 points (Green)
- **Medium**: 40-69 points (Yellow)
- **High**: 70-100 points (Red)

---

## 📁 Files Created/Updated

### **Backend:**
- `packages/backend/src/services/risk-score.service.ts` - Risk calculation service
- `packages/backend/src/services/alert.service.ts` - Email alerts service
- `packages/backend/src/routes/alerts.routes.ts` - Alert routes
- Updated: `packages/backend/src/routes/dashboard.routes.ts` - Integrated risk score calculation
- Updated: `packages/backend/src/services/email.service.ts` - Added generic sendEmail function
- Updated: `packages/backend/src/index.ts` - Added alerts routes

---

## 🚀 How to Use

### **1. Calculate Risk Score**
```bash
GET /api/dashboard/health-risk-score
Headers: Authorization: Bearer <token>
```

Returns:
```json
{
  "score": 45,
  "riskLevel": "medium",
  "factors": {
    "locationRisk": 15,
    "regionalIndex": 12,
    "symptomHistory": 10,
    "outbreakProximity": 8
  },
  "breakdown": {
    "location": "Delhi",
    "nearbyOutbreaks": 5,
    "regionalIndex": 65.5,
    "userReports": 2
  },
  "recommendations": [
    "⚠️ Moderate risk. Stay vigilant about your health.",
    "🧼 Maintain good hygiene practices."
  ]
}
```

### **2. Trigger Alerts (Admin)**
```bash
POST /api/alerts/check
Headers: Authorization: Bearer <admin-token>
```

### **3. Automatic Alerts**
- Alerts are sent when:
  - High-risk outbreak detected in user's area
  - User's risk score reaches high level (≥60)
- Can be triggered manually or scheduled via cron job

---

## ✅ Phase 6 Tasks Completed

- ✅ Develop algorithm to compute Health Risk Score (0-100)
- ✅ Automate email alerts for local outbreaks and prevention measures

---

## 🎯 Next Steps

**Phase 7: Security & Localization**
- AES data encryption
- Multi-language support
- Security audits

---

**✅ Phase 6: COMPLETE!** 🎉

The risk scoring and alert system is now fully functional!

