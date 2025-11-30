/**
 * Certificate Service
 * Generates and manages achievement certificates for users
 */

import { db } from "../db/index.js";
import { userCertificates, userContributions } from "../db/schema/rewards.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";
import puppeteer from "puppeteer";

export const CERTIFICATE_POINTS_THRESHOLD = 100;

/**
 * Generate a unique certificate number
 */
function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PATHOGEN-${timestamp}-${random}`;
}

/**
 * Check if user can claim a certificate (has 100+ points and hasn't claimed yet)
 */
export async function canClaimCertificate(userId: string): Promise<{
  canClaim: boolean;
  reason?: string;
  points: number;
  hasCertificate: boolean;
}> {
  try {
    // Get user's contribution
    const [contribution] = await db
      .select()
      .from(userContributions)
      .where(eq(userContributions.userId, userId))
      .limit(1);

    if (!contribution) {
      return {
        canClaim: false,
        reason: "No contribution data found",
        points: 0,
        hasCertificate: false,
      };
    }

    const points = contribution.totalPoints || 0;

    // Check if user already has a certificate
    let hasCertificate = false;
    try {
      const existingCert = await db
        .select()
        .from(userCertificates)
        .where(eq(userCertificates.userId, userId))
        .limit(1);
      hasCertificate = existingCert.length > 0;
    } catch (tableError: any) {
      // If certificate table doesn't exist yet, assume no certificate
      if (tableError.message?.includes("does not exist") || tableError.message?.includes("relation")) {
        hasCertificate = false;
      } else {
        throw tableError;
      }
    }

    if (hasCertificate) {
      return {
        canClaim: false,
        reason: "Certificate already claimed",
        points,
        hasCertificate: true,
      };
    }

    if (points < CERTIFICATE_POINTS_THRESHOLD) {
      return {
        canClaim: false,
        reason: `Need ${CERTIFICATE_POINTS_THRESHOLD - points} more points to claim certificate`,
        points,
        hasCertificate: false,
      };
    }

    return {
      canClaim: true,
      points,
      hasCertificate: false,
    };
  } catch (error: any) {
    // Handle table not existing gracefully
    if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
      return {
        canClaim: false,
        reason: "Certificate system not available",
        points: 0,
        hasCertificate: false,
      };
    }
    throw error;
  }
}

/**
 * Claim a certificate for a user (creates certificate record)
 */
export async function claimCertificate(userId: string): Promise<{
  id: string;
  certificateNumber: string;
  claimedAt: Date;
}> {
  // Check if user can claim
  const checkResult = await canClaimCertificate(userId);

  if (!checkResult.canClaim) {
    throw new Error(checkResult.reason || "Cannot claim certificate");
  }

  // Double-check: Ensure user has at least 100 points (strict validation)
  if (checkResult.points < CERTIFICATE_POINTS_THRESHOLD) {
    throw new Error(
      `You need ${CERTIFICATE_POINTS_THRESHOLD} points to claim a certificate. You currently have ${checkResult.points} points.`
    );
  }

  // Get user info
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  // Generate certificate number
  const certificateNumber = generateCertificateNumber();

  // Create certificate record - ensure pointsAtTime is at least 100
  const pointsAtClaim = Math.max(checkResult.points, CERTIFICATE_POINTS_THRESHOLD);
  
  try {
    const [certificate] = await db
      .insert(userCertificates)
      .values({
        userId,
        certificateType: "achievement",
        certificateName: `${CERTIFICATE_POINTS_THRESHOLD} Points Achievement Certificate`,
        pointsAtTime: pointsAtClaim,
        certificateNumber,
      })
      .returning();

    return {
      id: certificate.id,
      certificateNumber,
      claimedAt: certificate.claimedAt || new Date(),
    };
  } catch (insertError: any) {
    // Handle unique constraint violation (certificate already exists)
    if (insertError.message?.includes("UNIQUE constraint") || insertError.message?.includes("unique constraint") || insertError.code === "23505") {
      // Check if certificate already exists
      const existingCert = await getUserCertificate(userId);
      if (existingCert) {
        return {
          id: existingCert.id,
          certificateNumber: existingCert.certificateNumber,
          claimedAt: existingCert.claimedAt,
        };
      }
      throw new Error("Certificate already exists for this user");
    }
    // Re-throw other errors
    console.error("Error inserting certificate:", insertError);
    throw new Error(`Failed to create certificate: ${insertError.message || "Unknown error"}`);
  }
}

/**
 * Get user's certificate
 */
export async function getUserCertificate(userId: string) {
  try {
    const [certificate] = await db
      .select()
      .from(userCertificates)
      .where(eq(userCertificates.userId, userId))
      .limit(1);

    if (!certificate) {
      return null;
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return {
      ...certificate,
      userName: user?.name || "User",
      userEmail: user?.email || "",
    };
  } catch (error: any) {
    // If table doesn't exist yet, return null
    if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
      return null;
    }
    throw error;
  }
}

/**
 * Generate certificate HTML content for PDF generation
 * Professional certificate design fitting perfectly on A4 landscape page
 */
export function generateCertificateHTML(data: {
  userName: string;
  certificateNumber: string;
  points: number;
  issuedDate: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate of Achievement - ${data.userName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    @page {
      size: A4 landscape;
      margin: 0;
    }
    html, body {
      width: 297mm;
      height: 210mm;
      margin: 0;
      padding: 0;
      font-family: 'Times New Roman', Times, serif;
    }
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    .certificate-wrapper {
      width: 297mm;
      height: 210mm;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 7mm;
    }
    .certificate-container {
      width: 283mm;
      height: 196mm;
      background: #ffffff;
      padding: 18mm 22mm;
      position: relative;
      border: 6mm solid #667eea;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .border-decoration {
      position: absolute;
      border: 1.5mm solid #667eea;
      top: 10mm;
      left: 10mm;
      right: 10mm;
      bottom: 10mm;
      pointer-events: none;
    }
    .logo {
      position: absolute;
      top: 12mm;
      right: 20mm;
      font-size: 16pt;
      font-weight: bold;
      color: #667eea;
      font-family: Arial, sans-serif;
      letter-spacing: 1pt;
    }
    .certificate-header {
      text-align: center;
      margin-bottom: 10mm;
      padding-top: 3mm;
    }
    .certificate-title {
      font-size: 26pt;
      font-weight: bold;
      color: #4f46e5;
      margin: 0 0 3mm 0;
      letter-spacing: 3pt;
      text-transform: uppercase;
      line-height: 1.2;
    }
    .certificate-subtitle {
      font-size: 11pt;
      color: #64748b;
      margin: 3mm 0 0 0;
      font-style: italic;
      line-height: 1.4;
    }
    .certificate-body {
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 3mm 0;
      min-height: 0;
    }
    .intro-text {
      font-size: 12pt;
      line-height: 1.8;
      color: #334155;
      margin: 0 0 5mm 0;
    }
    .user-name {
      font-size: 30pt;
      font-weight: bold;
      color: #4f46e5;
      margin: 6mm auto;
      padding: 3mm 15mm;
      border-bottom: 2.5pt solid #667eea;
      border-top: 2.5pt solid #667eea;
      display: inline-block;
      line-height: 1.3;
      letter-spacing: 0.5pt;
    }
    .achievement-text {
      font-size: 11pt;
      line-height: 1.7;
      color: #334155;
      margin: 0 0 3mm 0;
      max-width: 190mm;
    }
    .description-text {
      font-size: 10pt;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 5mm 0;
      max-width: 190mm;
      font-style: italic;
    }
    .certificate-details {
      margin: 5mm 0 0 0;
      font-size: 10pt;
      color: #64748b;
      line-height: 1.5;
    }
    .certificate-footer {
      margin-top: 8mm;
      padding-top: 4mm;
      border-top: 1pt solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .signature {
      text-align: center;
      width: 60mm;
    }
    .signature-line {
      border-top: 1.5pt solid #1e293b;
      width: 100%;
      margin-top: 15mm;
      padding-top: 2mm;
      font-weight: bold;
      font-size: 9pt;
      line-height: 1.3;
    }
    .signature-label {
      margin-top: 1.5mm;
      font-size: 7pt;
      color: #64748b;
      line-height: 1.3;
    }
    .certificate-number {
      position: absolute;
      bottom: 8mm;
      right: 16mm;
      font-size: 7pt;
      color: #94a3b8;
      font-family: 'Courier New', monospace;
    }
    strong {
      color: #4f46e5;
      font-weight: bold;
    }
    p {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div class="certificate-wrapper">
    <div class="certificate-container">
      <div class="border-decoration"></div>
      <div class="logo">PathoGen</div>
      
      <div class="certificate-header">
        <h1 class="certificate-title">Certificate of Achievement</h1>
        <p class="certificate-subtitle">Recognizing Outstanding Contribution to Public Health</p>
      </div>
      
      <div class="certificate-body">
        <p class="intro-text">This is to certify that</p>
        <div class="user-name">${data.userName}</div>
        <p class="achievement-text">
          has successfully achieved <strong>${data.points.toLocaleString('en-IN')} points</strong> 
          by contributing to public health monitoring through verified symptom reports.
        </p>
        <p class="description-text">
          This certificate recognizes their dedication and contribution to the PathoGen 
          Public Health Monitoring Platform and the betterment of community health.
        </p>
        <div class="certificate-details">
          <p>Issued on: <strong>${data.issuedDate}</strong></p>
        </div>
      </div>
      
      <div class="certificate-footer">
        <div class="signature">
          <div class="signature-line">PathoGen Team</div>
          <div class="signature-label">Digital Signature</div>
        </div>
        <div class="signature">
          <div class="signature-line">Date: ${data.issuedDate}</div>
          <div class="signature-label">Issue Date</div>
        </div>
      </div>
      
      <div class="certificate-number">Certificate No: ${data.certificateNumber}</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate PDF from certificate HTML using Puppeteer
 * Ensures proper rendering with proper alignment and organization
 */
export async function generateCertificatePDF(data: {
  userName: string;
  certificateNumber: string;
  points: number;
  issuedDate: string;
}): Promise<Buffer> {
  const htmlContent = generateCertificateHTML(data);
  
  let browser;
  try {
    // Launch browser with appropriate options
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--font-render-hinting=none',
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport to match A4 landscape dimensions
    await page.setViewport({
      width: 1123, // A4 landscape width in pixels at 96 DPI
      height: 794, // A4 landscape height in pixels at 96 DPI
    });
    
    // Set content and wait for everything to load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Wait a bit more to ensure all fonts and styles are rendered
    await page.waitForTimeout(500);

    // Generate PDF with proper settings for A4 landscape
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    return Buffer.from(pdfBuffer);
  } catch (error: any) {
    console.error('Error generating certificate PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

