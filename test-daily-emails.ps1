# Test Daily Email Notifications
# This script tests the daily email notification system

Write-Host "🧪 Testing Daily Email Notifications" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if endpoint is accessible
Write-Host "1. Testing manual trigger endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/alerts/daily-emails" -Method POST -ContentType "application/json"
    Write-Host "✅ Endpoint accessible" -ForegroundColor Green
    Write-Host "   Response: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error calling endpoint:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Check server logs for:" -ForegroundColor Yellow
Write-Host "   - '📧 Starting daily disease alert email job...'" -ForegroundColor Gray
Write-Host "   - '📊 Found X eligible users for daily alerts'" -ForegroundColor Gray
Write-Host "   - '✅ Successfully sent daily alert to user@email.com'" -ForegroundColor Gray
Write-Host "   - '✅ Daily alert job completed: X sent, Y failed'" -ForegroundColor Gray

Write-Host ""
Write-Host "3. Verify email configuration:" -ForegroundColor Yellow
Write-Host "   - Check that EMAIL_USER and EMAIL_PASSWORD are set in .env" -ForegroundColor Gray
Write-Host "   - Check server startup logs for '✅ Email configuration verified successfully'" -ForegroundColor Gray

Write-Host ""
Write-Host "4. Verify user eligibility:" -ForegroundColor Yellow
Write-Host "   - User must have emailNotificationsEnabled = true" -ForegroundColor Gray
Write-Host "   - User must have email, district, and state set" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Test complete! Check server logs and email inbox." -ForegroundColor Green

