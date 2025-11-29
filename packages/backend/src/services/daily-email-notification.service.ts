import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { diseaseOutbreaks, diseases } from "../db/schema/diseases.js";
import { diseasePrevention } from "../db/schema/prevention.js";
import { eq, and, sql, desc, gte, lte, or, inArray } from "drizzle-orm";
import { sendEmail } from "./email.service.js";

interface TrendingDisease {
  diseaseId: string;
  diseaseName: string;
  totalCases: number;
  trend: string;
  riskLevel: string;
  district: string;
  state: string;
}

interface PreventionMeasure {
  title: string;
  description: string;
  measures: string[];
  category: string;
  priority: string;
  source: string;
}

/**
 * Get trending diseases for a specific district
 * Divides 30 days of data into 7-day windows and rotates daily
 * Uses the same logic as the dashboard API for consistency
 */
async function getTrendingDiseasesForDistrict(
  state: string,
  district: string
): Promise<TrendingDisease[]> {
  // Get all diseases from last 30 days (same as Prevention Measures section)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Calculate which 7-day window to show today
  // Divide 30 days into ~4-5 windows of 7 days each
  // Use day of week (0-6) to rotate through windows
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Map day of week to window (0-6 maps to windows 0-4, cycling)
  // This creates a rotation: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=0, Sun=1
  const windowIndex = dayOfWeek <= 4 ? dayOfWeek : (dayOfWeek - 5);
  
  // Calculate date range for this window
  // Window 0: Days 1-7 (most recent week: today to 6 days ago)
  // Window 1: Days 8-14 (7 to 13 days ago)
  // Window 2: Days 15-21 (14 to 20 days ago)
  // Window 3: Days 22-28 (21 to 27 days ago)
  // Window 4: Days 29-30 (28 to 29 days ago)
  const daysPerWindow = 7;
  
  let windowStartDate: Date;
  let windowEndDate: Date;
  
  if (windowIndex === 0) {
    // Window 0: Most recent 7 days (today to 6 days ago)
    windowEndDate = new Date();
    windowEndDate.setHours(23, 59, 59, 999);
    windowStartDate = new Date();
    windowStartDate.setDate(windowStartDate.getDate() - 6);
    windowStartDate.setHours(0, 0, 0, 0);
  } else if (windowIndex === 4) {
    // Window 4: Days 29-30 (28 to 29 days ago)
    windowEndDate = new Date();
    windowEndDate.setDate(windowEndDate.getDate() - 28);
    windowEndDate.setHours(23, 59, 59, 999);
    windowStartDate = new Date();
    windowStartDate.setDate(windowStartDate.getDate() - 30);
    windowStartDate.setHours(0, 0, 0, 0);
  } else {
    // Windows 1-3: Each covers 7 days
    const endDaysAgo = windowIndex * daysPerWindow;
    const startDaysAgo = (windowIndex + 1) * daysPerWindow - 1;
    
    windowEndDate = new Date();
    windowEndDate.setDate(windowEndDate.getDate() - endDaysAgo);
    windowEndDate.setHours(23, 59, 59, 999);
    
    windowStartDate = new Date();
    windowStartDate.setDate(windowStartDate.getDate() - startDaysAgo);
    windowStartDate.setHours(0, 0, 0, 0);
  }

  const conditions = [
    eq(diseaseOutbreaks.state, state),
    eq(diseaseOutbreaks.district, district),
    gte(diseaseOutbreaks.reportedDate, windowStartDate),
    lte(diseaseOutbreaks.reportedDate, windowEndDate),
  ];
  
  const dayRange = windowIndex === 0 
    ? "Days 1-7 (most recent)" 
    : windowIndex === 4 
    ? "Days 29-30" 
    : `Days ${(windowIndex * 7) + 1}-${(windowIndex + 1) * 7}`;
  console.log(`📅 Fetching diseases for window ${windowIndex + 1}/5: ${dayRange} (${windowStartDate.toISOString().split('T')[0]} to ${windowEndDate.toISOString().split('T')[0]})`);

  // Use the same query structure as dashboard routes for consistency
  const selectFields = {
    diseaseId: diseaseOutbreaks.diseaseId,
    diseaseName: sql<string>`MAX(${diseases.name})`,
    caseCount: sql<number>`sum(${diseaseOutbreaks.caseCount})`,
    trend: sql<string>`MAX(${diseaseOutbreaks.trend})`,
    trendPercentage: sql<number>`MAX(${diseaseOutbreaks.trendPercentage})`,
    riskLevel: sql<string>`MAX(${diseaseOutbreaks.riskLevel})`,
    state: sql<string>`MAX(${diseaseOutbreaks.state})`,
    district: sql<string>`MAX(${diseaseOutbreaks.district})`,
  };

  const trending = await db
    .select(selectFields)
    .from(diseaseOutbreaks)
    .leftJoin(diseases, eq(diseaseOutbreaks.diseaseId, diseases.id))
    .where(and(...conditions))
    .groupBy(diseaseOutbreaks.diseaseId)
    .orderBy(desc(sql<number>`sum(${diseaseOutbreaks.caseCount})`))
    .limit(20); // Get more to account for deduplication

  // Deduplicate by disease name (case-insensitive) - same as dashboard route
  const seenDiseaseNames = new Map<string, TrendingDisease>();
  for (const item of trending) {
    const diseaseName = typeof item.diseaseName === "string" 
      ? item.diseaseName 
      : String(item.diseaseName || "");
    
    if (!diseaseName) continue;
    
    const diseaseNameLower = diseaseName.toLowerCase().trim();
    if (!seenDiseaseNames.has(diseaseNameLower)) {
      seenDiseaseNames.set(diseaseNameLower, {
        diseaseId: item.diseaseId,
        diseaseName,
        totalCases: Number(item.caseCount) || 0,
        trend: typeof item.trend === "string" ? item.trend : String(item.trend || "stable"),
        riskLevel: typeof item.riskLevel === "string" ? item.riskLevel : String(item.riskLevel || "medium"),
        district: typeof item.district === "string" ? item.district : String(item.district || ""),
        state: typeof item.state === "string" ? item.state : String(item.state || ""),
      });
    } else {
      // If duplicate found (same name), keep the one with higher case count
      const existing = seenDiseaseNames.get(diseaseNameLower)!;
      const existingCases = Number(existing.totalCases) || 0;
      const currentCases = Number(item.caseCount) || 0;
      if (currentCases > existingCases) {
        seenDiseaseNames.set(diseaseNameLower, {
          ...existing,
          totalCases: currentCases,
        });
      }
    }
  }
  
  const uniqueTrending = Array.from(seenDiseaseNames.values());
  // Re-sort by case count after deduplication
  uniqueTrending.sort((a, b) => {
    return b.totalCases - a.totalCases;
  });
  
  // Return top 10 after deduplication
  return uniqueTrending.slice(0, 10);
}

/**
 * Get prevention measures for diseases
 * Uses the same logic as the dashboard prevention-measures API for consistency
 */
async function getPreventionMeasuresForDiseases(
  diseaseIds: string[],
  state: string,
  district: string
): Promise<Record<string, PreventionMeasure[]>> {
  if (diseaseIds.length === 0) {
    return {};
  }

  // Get diseases that are active in this district (same as dashboard route)
  const districtDiseases = await db
    .selectDistinct({ 
      diseaseId: diseaseOutbreaks.diseaseId,
      diseaseName: diseases.name 
    })
    .from(diseaseOutbreaks)
    .innerJoin(diseases, eq(diseaseOutbreaks.diseaseId, diseases.id))
    .where(
      and(
        eq(diseaseOutbreaks.state, state),
        eq(diseaseOutbreaks.district, district),
        eq(diseases.isActive, true),
        inArray(diseaseOutbreaks.diseaseId, diseaseIds)
      )
    )
    .limit(20);

  if (districtDiseases.length === 0) {
    return {};
  }

  const activeDiseaseIds = districtDiseases.map(d => d.diseaseId);

  // Get prevention measures with priority: district-specific > state-specific > general
  // Same logic as dashboard route
  const preventionMeasures = await db
    .select()
    .from(diseasePrevention)
    .where(
      and(
        inArray(diseasePrevention.diseaseId, activeDiseaseIds),
        eq(diseasePrevention.isActive, true),
        or(
          // District-specific
          and(
            eq(diseasePrevention.state, state),
            eq(diseasePrevention.district, district)
          ),
          // State-specific
          and(
            eq(diseasePrevention.state, state),
            sql`${diseasePrevention.district} IS NULL`
          ),
          // General (no state/district)
          and(
            sql`${diseasePrevention.state} IS NULL`,
            sql`${diseasePrevention.district} IS NULL`
          )
        )
      )
    )
    .orderBy(
      // Prioritize district-specific, then state-specific, then general
      sql`CASE 
        WHEN ${diseasePrevention.district} IS NOT NULL THEN 1
        WHEN ${diseasePrevention.state} IS NOT NULL THEN 2
        ELSE 3
      END`,
      desc(diseasePrevention.priority)
    );

  // Group by disease name (same format as dashboard route)
  const grouped: Record<string, PreventionMeasure[]> = {};
  
  districtDiseases.forEach(disease => {
    grouped[disease.diseaseName] = preventionMeasures
      .filter(pm => pm.diseaseId === disease.diseaseId)
      .map(pm => {
        const measures = Array.isArray(pm.measures) ? pm.measures : [];
        return {
          title: pm.title,
          description: pm.description || "",
          measures,
          category: pm.category || "",
          priority: pm.priority || "medium",
          source: pm.source || "",
        };
      });
  });

  return grouped;
}

/**
 * Generate HTML email content for daily disease alert
 */
function generateDailyAlertEmail(
  userName: string,
  district: string,
  state: string,
  trendingDiseases: TrendingDisease[],
  preventionMeasures: Record<string, PreventionMeasure[]>
): string {
  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let diseasesHtml = "";
  if (trendingDiseases.length === 0) {
    diseasesHtml = `
      <div style="background: #F0F7FF; border-left: 4px solid #1B7BFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #1B7BFF; margin: 0; font-weight: 600;">✅ Great News!</p>
        <p style="color: #6B7280; margin: 10px 0 0 0;">No trending diseases reported in ${district}, ${state} in this week's window. Keep following preventive measures to stay healthy!</p>
      </div>
    `;
  } else {
    trendingDiseases.forEach((disease) => {
      const riskColor =
        disease.riskLevel === "high"
          ? "#EF4444"
          : disease.riskLevel === "medium"
          ? "#F59E0B"
          : "#10B981";
      const trendIcon = disease.trend === "rising" ? "📈" : disease.trend === "falling" ? "📉" : "➡️";
      const trendText =
        disease.trend === "rising"
          ? "Rising"
          : disease.trend === "falling"
          ? "Falling"
          : "Stable";

      const measures = preventionMeasures[disease.diseaseName] || [];
      let measuresHtml = "";

      if (measures.length > 0) {
        // Take top 2 prevention measures
        const topMeasures = measures.slice(0, 2);
        measuresHtml = `
          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-top: 12px;">
            <h4 style="color: #1A1A1A; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Prevention Measures:</h4>
            ${topMeasures
              .map((measure) => {
                const measureItems = Array.isArray(measure.measures)
                  ? measure.measures.slice(0, 3).join(", ")
                  : "";
                return `
                  <div style="margin-bottom: 12px;">
                    <p style="color: #1A1A1A; margin: 0 0 4px 0; font-weight: 600; font-size: 13px;">${measure.title}</p>
                    ${measureItems ? `<p style="color: #6B7280; margin: 0; font-size: 12px;">${measureItems}</p>` : ""}
                  </div>
                `;
              })
              .join("")}
          </div>
        `;
      }

      diseasesHtml += `
        <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <h3 style="color: #1A1A1A; margin: 0; font-size: 18px; font-weight: 700;">${disease.diseaseName}</h3>
            <span style="background: ${riskColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
              ${disease.riskLevel} Risk
            </span>
          </div>
          <div style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px; color: #6B7280;">
            <span>${trendIcon} ${trendText}</span>
            <span>📊 ${disease.totalCases} cases</span>
          </div>
          ${measuresHtml}
        </div>
      `;
    });
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #F5F7FA;">
        <div style="background: linear-gradient(135deg, #4D9AFF 0%, #1B7BFF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #FFFFFF; margin: 0;">PathoGen</h1>
          <p style="color: #FFFFFF; margin: 10px 0 0 0;">Daily Disease Alert</p>
        </div>
        
        <div style="background: #FFFFFF; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <p style="color: #6B7280; margin: 0 0 20px 0;">Hello ${userName || "there"},</p>
          
          <p style="color: #1A1A1A; margin: 0 0 20px 0;">
            Here's your daily update on trending diseases and prevention measures for <strong>${district}, ${state}</strong> as of ${date}.
          </p>
          
          <div style="background: #F0F7FF; border-left: 4px solid #1B7BFF; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1B7BFF; margin: 0; font-weight: 600; font-size: 14px;">📍 Your Location: ${district}, ${state}</p>
          </div>
          
          <h2 style="color: #1A1A1A; margin: 30px 0 20px 0; font-size: 22px;">Trending Diseases</h2>
          
          ${diseasesHtml}
          
          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #E5E7EB;">
            <h3 style="color: #1A1A1A; margin: 0 0 12px 0; font-size: 16px;">💡 General Prevention Tips</h3>
            <ul style="color: #6B7280; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Wash hands frequently with soap and water</li>
              <li>Maintain good personal hygiene</li>
              <li>Stay hydrated and eat nutritious food</li>
              <li>Get adequate sleep and exercise</li>
              <li>Follow local health guidelines</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/prevention-measures" 
               style="display: inline-block; background: #1B7BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Full Prevention Measures
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
            This is an automated daily alert from PathoGen. You can manage your email preferences in your account settings.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 12px;">
          <p>🔒 Your data is encrypted (AES-256) and never shared</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send daily disease alert email to a user
 */
export async function sendDailyDiseaseAlert(userId: string): Promise<boolean> {
  try {
    // Get user with email and location
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.emailNotificationsEnabled, true)))
      .limit(1);

    if (!user) {
      console.log(`⏭️ Skipping user ${userId}: email notifications disabled or user not found`);
      return false;
    }

    if (!user.email) {
      console.log(`⏭️ Skipping user ${userId}: no email address`);
      return false;
    }

    if (!user.district || !user.state) {
      console.log(`⏭️ Skipping user ${userId}: no district or state set`);
      return false;
    }

    // Get trending diseases for user's district (rotating 7-day windows from last 30 days)
    console.log(`📊 Fetching trending diseases for ${user.district}, ${user.state} (7-day rotating window from last 30 days)`);
    const trendingDiseases = await getTrendingDiseasesForDistrict(user.state, user.district);
    console.log(`📊 Found ${trendingDiseases.length} trending diseases:`, trendingDiseases.map(d => d.diseaseName));

    // Get disease IDs
    const diseaseIds = trendingDiseases.map((d) => d.diseaseId).filter(Boolean);
    console.log(`📊 Disease IDs to fetch prevention measures for:`, diseaseIds);

    // Get prevention measures (using same logic as Prevention Measures section)
    console.log(`📊 Fetching prevention measures for ${diseaseIds.length} diseases`);
    const preventionMeasures =
      diseaseIds.length > 0
        ? await getPreventionMeasuresForDiseases(diseaseIds, user.state, user.district)
        : {};
    console.log(`📊 Found prevention measures for diseases:`, Object.keys(preventionMeasures));

    // Generate email content
    const html = generateDailyAlertEmail(
      user.name || "User",
      user.district,
      user.state,
      trendingDiseases,
      preventionMeasures
    );

    const subject = `PathoGen Daily Alert: Trending Diseases in ${user.district}, ${user.state}`;

    // Send email
    await sendEmail(user.email, subject, html);

    console.log(`✅ Daily alert sent to ${user.email} (${user.district}, ${user.state})`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending daily alert to user ${userId}:`, error);
    return false;
  }
}

/**
 * Send daily disease alerts to all eligible users
 */
export async function sendDailyDiseaseAlertsToAllUsers(): Promise<void> {
  console.log("📧 Starting daily disease alert email job...");

  try {
    // Get all users with email notifications enabled and email/district/state set
    const eligibleUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        district: users.district,
        state: users.state,
      })
      .from(users)
      .where(
        and(
          eq(users.emailNotificationsEnabled, true),
          sql`${users.email} IS NOT NULL`,
          sql`${users.district} IS NOT NULL`,
          sql`${users.state} IS NOT NULL`
        )
      );

    console.log(`📊 Found ${eligibleUsers.length} eligible users for daily alerts`);

    if (eligibleUsers.length === 0) {
      console.log("⏭️ No eligible users found. Skipping email job.");
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    for (let i = 0; i < eligibleUsers.length; i += batchSize) {
      const batch = eligibleUsers.slice(i, i + batchSize);
      const promises = batch.map((user) => sendDailyDiseaseAlert(user.id));

      const results = await Promise.allSettled(promises);
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          successCount++;
        } else {
          failureCount++;
          console.error(`❌ Failed to send alert to ${batch[index].email}`);
        }
      });

      // Wait a bit between batches to avoid rate limiting
      if (i + batchSize < eligibleUsers.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      }
    }

    console.log(`✅ Daily alert job completed: ${successCount} sent, ${failureCount} failed`);
  } catch (error) {
    console.error("❌ Error in daily alert job:", error);
    throw error;
  }
}

