/**
 * Alerts Routes
 * Handles alert checking and sending (admin/manual trigger)
 */

import express, { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";
import { checkAndSendAlerts } from "../services/alert.service.js";
import { sendDailyDiseaseAlertsToAllUsers } from "../services/daily-email-notification.service.js";

const router: Router = express.Router();

/**
 * POST /api/alerts/check
 * Manually trigger alert checking and sending (admin only)
 */
router.post("/check", authenticate, requireAdmin, async (_req, res) => {
  try {
    // Run alert check in background (don't block response)
    checkAndSendAlerts().catch((error) => {
      console.error("Error in background alert check:", error);
    });

    res.json({
      success: true,
      message: "Alert check initiated. Alerts will be sent to eligible users.",
    });
  } catch (error: any) {
    console.error("Error initiating alert check:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to initiate alert check",
      details: error.message,
    });
  }
});

/**
 * POST /api/alerts/daily-emails
 * Manually trigger daily disease alert emails
 * Useful for testing the daily email notification system
 */
router.post("/daily-emails", async (_req, res) => {
  try {
    console.log("📧 Manual daily email notification triggered");
    
    // Run in background but also track results
    sendDailyDiseaseAlertsToAllUsers()
      .then(() => {
        console.log("✅ Manual daily email notification completed successfully");
      })
      .catch((error) => {
        console.error("❌ Error in manual daily email notification:", error);
      });

    res.json({
      success: true,
      message: "Daily email notification job initiated. Emails will be sent to eligible users.",
      note: "Check server logs for detailed results.",
    });
  } catch (error: any) {
    console.error("Error initiating daily email notification:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to initiate daily email notification",
      details: error.message,
    });
  }
});

export default router;

