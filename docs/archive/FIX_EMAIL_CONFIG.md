# 🔧 Fix Email Configuration

## Problem
Server shows "Failed to send OTP. Please try again." and emails are not being sent.

## Root Causes

1. **Quotes in .env file** - Email values have quotes which can cause issues
2. **Invalid cron schedule** - Was set to "59 24 * * *" (24 is not a valid hour)
3. **Error messages not detailed enough** - Hard to diagnose issues

## Fixes Applied

### 1. Fixed Email Configuration Handling
- Added code to automatically remove quotes from EMAIL_USER and EMAIL_PASSWORD
- Improved error messages to show detailed error information
- Added better error logging for email authentication failures

### 2. Fixed Cron Schedule
- Changed from invalid `"59 24 * * *"` to correct `"56 16 * * *"` (4:56 PM IST)

### 3. Improved Error Handling
- Email errors now show detailed error messages
- Specific error codes are logged (e.g., EAUTH for authentication failures)
- Better diagnostics for email configuration issues

## How to Fix .env File

### Current (with quotes - can cause issues):
```env
EMAIL_USER="PathoGen.co.int.in@gmail.com"
EMAIL_PASSWORD="sobppuzxbudfsdrr"
```

### Correct (without quotes):
```env
EMAIL_USER=PathoGen.co.int.in@gmail.com
EMAIL_PASSWORD=sobppuzxbudfsdrr
```

**Note**: The code now handles quotes automatically, but it's better to remove them from .env file.

## Verify Email Configuration

### Check Server Logs
On startup, you should see:
```
✅ Email configuration verified for: PathoGen.co.int.in@gmail.com
```

If you see:
```
❌ Email configuration error: EAUTH
⚠️ Authentication failed - check EMAIL_PASSWORD (use Gmail App Password, not regular password)
```

Then:
1. Make sure you're using Gmail App Password (not regular password)
2. Verify 2-Step Verification is enabled on Gmail account
3. Check that EMAIL_PASSWORD doesn't have quotes or extra spaces

## Test Email Sending

After restarting the server:

1. **Test OTP sending**:
   - Try to login
   - Check server logs for detailed error messages

2. **Check server logs for**:
   - `✅ Email configuration verified for: [email]` - Good!
   - `❌ Error sending OTP email:` - Check the error details

## Common Issues

### Issue 1: EAUTH Error
**Solution**: Use Gmail App Password, not regular password
- Go to: https://myaccount.google.com/apppasswords
- Generate app password for "Mail"
- Use that password in EMAIL_PASSWORD

### Issue 2: Quotes in .env
**Solution**: Remove quotes (code now handles this automatically, but better to remove)

### Issue 3: Invalid Credentials
**Solution**: 
- Verify email address is correct
- Verify app password is correct (16 characters, no spaces)

## Next Steps

1. **Restart the server** to apply fixes
2. **Check server logs** for email verification message
3. **Test login** to see if OTP emails are sent
4. **Check error logs** if emails still fail

All fixes are applied! Restart the server and test.

