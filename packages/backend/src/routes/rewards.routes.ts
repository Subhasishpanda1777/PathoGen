/**
 * Rewards Routes
 * Handles user rewards, badges, and contributions
 */

import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getUserRewards, redeemGiftCard } from "../services/rewards.service.js";
import { db } from "../db/index.js";
import { userContributions, giftCardRedemptions, userCertificates } from "../db/schema/rewards.js";
import { users } from "../db/schema/users.js";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  canClaimCertificate,
  claimCertificate,
  getUserCertificate,
  generateCertificatePDF,
  CERTIFICATE_POINTS_THRESHOLD,
} from "../services/certificate.service.js";

const router = express.Router();

/**
 * GET /api/rewards/me
 * Get current user's rewards, badges, and contributions
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    try {
      const rewards = await getUserRewards(userId);

      res.json({
        success: true,
        ...rewards,
      });
    } catch (dbError: any) {
      // If tables don't exist, return empty structure
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("relation")) {
        console.log("[Rewards] Rewards tables don't exist yet, returning empty structure");
        res.json({
          success: true,
          contribution: {
            userId,
            totalReports: 0,
            verifiedReports: 0,
            totalPoints: 0,
            badgesCount: 0,
          },
          badges: [],
          recentRewards: [],
        });
      } else {
        throw dbError;
      }
    }
  } catch (error: any) {
    console.error("Error fetching user rewards:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch rewards",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/rewards/leaderboard
 * Get top users by points (leaderboard)
 */
router.get("/leaderboard", authenticate, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Check if tables exist
    try {
      const leaderboard = await db
        .select({
          userId: userContributions.userId,
          totalPoints: userContributions.totalPoints,
          verifiedReports: userContributions.verifiedReports,
          totalReports: userContributions.totalReports,
          badgesCount: userContributions.badgesCount,
          name: users.name,
          email: users.email,
        })
        .from(userContributions)
        .innerJoin(users, eq(userContributions.userId, users.id))
        .orderBy(desc(userContributions.totalPoints))
        .limit(Number(limit));

      // Get current user's rank
      const userId = req.user?.userId;
      let userRank = null;
      if (userId) {
        const [userContribution] = await db
          .select()
          .from(userContributions)
          .where(eq(userContributions.userId, userId))
          .limit(1);

        if (userContribution) {
          // Count how many users have MORE points than the current user
          // Rank = count of users with more points + 1
          const rankResult = await db
            .select({
              count: sql<number>`COUNT(*)::int`,
            })
            .from(userContributions)
            .where(sql`${userContributions.totalPoints} > ${userContribution.totalPoints}`);

          const usersWithMorePoints = Number(rankResult[0]?.count || 0);
          const calculatedRank = usersWithMorePoints + 1;

          userRank = {
            rank: calculatedRank,
            totalPoints: userContribution.totalPoints,
            verifiedReports: userContribution.verifiedReports,
          };
        }
      }

      // Calculate ranks for leaderboard (handles ties correctly)
      let currentRank = 1;
      let previousPoints: number | null = null;
      const rankedLeaderboard = leaderboard.map((item, index) => {
        // If points are different from previous, update rank
        // Otherwise, keep the same rank (tie)
        if (previousPoints !== null && item.totalPoints !== previousPoints) {
          currentRank = index + 1;
        }
        previousPoints = item.totalPoints;
        
        return {
          rank: currentRank,
          userId: item.userId,
          name: item.name,
          email: item.email,
          totalPoints: item.totalPoints,
          verifiedReports: item.verifiedReports,
          totalReports: item.totalReports,
          badgesCount: item.badgesCount,
        };
      });

      res.json({
        success: true,
        leaderboard: rankedLeaderboard,
        userRank,
      });
    } catch (tableError: any) {
      // If tables don't exist, return empty leaderboard
      if (tableError.message?.includes("does not exist") || tableError.message?.includes("relation")) {
        console.log("[Rewards] user_contributions table doesn't exist yet, returning empty leaderboard");
        res.json({
          success: true,
          leaderboard: [],
          userRank: null,
        });
      } else {
        throw tableError;
      }
    }
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch leaderboard",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/rewards/redeem
 * Redeem points for gift card
 */
router.post("/redeem", authenticate, async (req, res) => {
  try {
    const { giftCardType } = req.body; // "flipkart" or "amazon"
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    if (!giftCardType || !["flipkart", "amazon"].includes(giftCardType)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid gift card type. Must be 'flipkart' or 'amazon'",
      });
    }

    const redemption = await redeemGiftCard(userId, giftCardType);

    res.json({
      success: true,
      message: "Gift card redemption request submitted successfully",
      redemption: {
        id: redemption.id,
        giftCardType: redemption.giftCardType,
        pointsUsed: redemption.pointsUsed,
        giftCardValue: redemption.giftCardValue,
        status: redemption.status,
      },
    });
  } catch (error: any) {
    console.error("Error redeeming gift card:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to redeem gift card",
      details: error.message,
    });
  }
});

/**
 * GET /api/rewards/redemptions
 * Get user's gift card redemption history
 */
router.get("/redemptions", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    // Check if table exists, if not return empty array
    try {
      const redemptions = await db
        .select()
        .from(giftCardRedemptions)
        .where(eq(giftCardRedemptions.userId, userId))
        .orderBy(desc(giftCardRedemptions.createdAt));

      res.json({
        success: true,
        redemptions,
      });
    } catch (tableError: any) {
      // If table doesn't exist, return empty array
      if (tableError.message?.includes("does not exist") || tableError.message?.includes("relation")) {
        console.log("[Rewards] gift_card_redemptions table doesn't exist yet, returning empty array");
        res.json({
          success: true,
          redemptions: [],
        });
      } else {
        throw tableError;
      }
    }
  } catch (error: any) {
    console.error("Error fetching redemptions:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch redemptions",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/rewards/certificate/check
 * Check if user can claim a certificate
 */
router.get("/certificate/check", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const result = await canClaimCertificate(userId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error checking certificate eligibility:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to check certificate eligibility",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/rewards/certificate/claim
 * Claim a certificate (user must have required points)
 */
router.post("/certificate/claim", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const certificateData = await claimCertificate(userId);

    // Get the full certificate details including user info
    const fullCertificate = await getUserCertificate(userId);

    if (!fullCertificate) {
      // If we just claimed but can't fetch it, something is wrong
      console.error("Certificate was claimed but could not be retrieved:", certificateData);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Certificate was claimed but could not be retrieved. Please try refreshing the page.",
      });
    }

    res.json({
      success: true,
      message: "Certificate claimed successfully",
      certificate: fullCertificate,
    });
  } catch (error: any) {
    console.error("Error claiming certificate:", error);
    console.error("Error stack:", error.stack);
    
    // Check if it's a database/table error
    if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
      return res.status(500).json({
        error: "Database Error",
        message: "Certificate table does not exist. Please run the database migration script first.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    res.status(400).json({
      error: "Bad Request",
      message: error.message || "Failed to claim certificate",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/rewards/certificate
 * Get user's certificate if they have one
 * Only returns certificate if it was properly claimed with 100+ points
 */
router.get("/certificate", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const certificate = await getUserCertificate(userId);

    if (!certificate) {
      return res.json({
        success: true,
        certificate: null,
      });
    }

    // Verify that the certificate was properly claimed with 100+ points
    if (!certificate.pointsAtTime || certificate.pointsAtTime < CERTIFICATE_POINTS_THRESHOLD) {
      // Return null if certificate is invalid (doesn't meet requirements)
      return res.json({
        success: true,
        certificate: null,
      });
    }

    res.json({
      success: true,
      certificate,
    });
  } catch (error: any) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch certificate",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/rewards/certificate/download
 * Generate and download certificate as PDF
 * Only allows download if certificate was properly claimed with 100+ points
 */
router.get("/certificate/download", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const certificate = await getUserCertificate(userId);

    if (!certificate) {
      return res.status(404).json({
        error: "Not Found",
        message: "Certificate not found. Please claim your certificate first. You need 100 points to claim a certificate.",
      });
    }

    // Verify that the certificate was properly claimed with 100+ points
    if (!certificate.pointsAtTime || certificate.pointsAtTime < CERTIFICATE_POINTS_THRESHOLD) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid certificate. Certificate must be claimed with at least 100 points.",
      });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    const issuedDate = new Date(certificate.claimedAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF({
      userName: user?.name || certificate.userName || "User",
      certificateNumber: certificate.certificateNumber,
      points: certificate.pointsAtTime,
      issuedDate,
    });

    // Send PDF with proper headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="PathoGen-Certificate-${certificate.certificateNumber}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length.toString());
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Error generating certificate PDF:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to generate certificate PDF",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;

