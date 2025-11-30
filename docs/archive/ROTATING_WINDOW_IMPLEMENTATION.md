# ✅ Rotating 7-Day Window Implementation - Complete

## 🎯 Feature Overview

The email notification system now automatically divides 30 days of disease data into 7-day windows and rotates through them daily. This ensures:
- Users see different diseases each day
- All diseases from the last 30 days are covered over the week
- Data matches the Prevention Measures section (30-day period)

## 📊 How It Works

### Window Rotation Schedule

The 30-day period is divided into 5 windows:

| Day of Week | Window | Date Range | Days Covered |
|------------|--------|-------------|--------------|
| **Monday** | Window 1 | Today to 6 days ago | Days 1-7 (most recent) |
| **Tuesday** | Window 2 | 7 to 13 days ago | Days 8-14 |
| **Wednesday** | Window 3 | 14 to 20 days ago | Days 15-21 |
| **Thursday** | Window 4 | 21 to 27 days ago | Days 22-28 |
| **Friday** | Window 5 | 28 to 29 days ago | Days 29-30 |
| **Saturday** | Window 1 | Today to 6 days ago | Days 1-7 (repeat) |
| **Sunday** | Window 2 | 7 to 13 days ago | Days 8-14 (repeat) |

### Example Timeline

If today is **Monday, December 2, 2024**:
- **Monday**: Shows diseases from Nov 25 - Dec 2 (Window 1)
- **Tuesday**: Shows diseases from Nov 18 - Nov 24 (Window 2)
- **Wednesday**: Shows diseases from Nov 11 - Nov 17 (Window 3)
- **Thursday**: Shows diseases from Nov 4 - Nov 10 (Window 4)
- **Friday**: Shows diseases from Nov 2 - Nov 3 (Window 5)
- **Saturday**: Shows diseases from Nov 25 - Dec 2 (Window 1, repeat)
- **Sunday**: Shows diseases from Nov 18 - Nov 24 (Window 2, repeat)

## 🔧 Implementation Details

### Code Location
`packages/backend/src/services/daily-email-notification.service.ts`

### Key Functions

1. **`getTrendingDiseasesForDistrict()`** - Lines 32-170
   - Calculates which window to use based on day of week
   - Fetches diseases for that specific 7-day window
   - Returns top 10 trending diseases

2. **Window Calculation Logic:**
   ```typescript
   const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
   const windowIndex = dayOfWeek <= 4 ? dayOfWeek : (dayOfWeek - 5);
   ```

3. **Date Range Calculation:**
   - Window 0: Today to 6 days ago
   - Window 1-3: Each covers 7 days
   - Window 4: Last 2 days of 30-day period (days 28-29)

## ✅ Benefits

1. **Consistent Data Source**: Uses same 30-day period as Prevention Measures section
2. **Daily Variety**: Different diseases shown each day
3. **Complete Coverage**: All 30 days covered over the week
4. **Automatic Rotation**: No manual configuration needed
5. **Predictable Schedule**: Users know which time period they're seeing

## 📧 Email Content

The email will show:
- Diseases from the current day's window
- Prevention measures for those diseases
- Clear indication of the time period covered

## 🧪 Testing

To test the rotation:

1. **Check Server Logs:**
   ```
   📅 Fetching diseases for window 1/5: Days 1-7 (most recent) (2024-11-25 to 2024-12-02)
   ```

2. **Verify Window Selection:**
   - Monday should show Window 1 (most recent)
   - Tuesday should show Window 2
   - And so on...

3. **Test Different Days:**
   - Manually trigger the email job on different days
   - Verify correct window is selected
   - Verify correct date range is queried

## 🔍 Debugging

If diseases aren't showing:

1. **Check the window calculation:**
   - Verify `dayOfWeek` is correct
   - Verify `windowIndex` maps correctly

2. **Check date ranges:**
   - Verify `windowStartDate` and `windowEndDate` are correct
   - Check server logs for the date range being queried

3. **Check database:**
   - Verify diseases exist in the date range
   - Check that state/district match user's location

## 📝 Summary

✅ **Implemented**: Rotating 7-day window system
✅ **Data Source**: 30 days (matches Prevention Measures section)
✅ **Rotation**: Automatic based on day of week
✅ **Coverage**: All 30 days covered over 5-7 days
✅ **Consistency**: Same query logic as dashboard API

The system is now fully automated and will rotate through different 7-day windows each day! 🎉

