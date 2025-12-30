import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Send password reset email via EmailIt
async function sendPasswordResetEmail(email: string, token: string) {
  const apiKey = process.env.EMAILIT_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  if (!apiKey) {
    throw new Error("EMAILIT_API_KEY is not set");
  }

  const response = await fetch("https://api.emailit.com/v1/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "Goalix <noreply@quantumdigitalplus.com>",
      to: email,
      reply_to: "noreply@quantumdigitalplus.com",
      subject: "Reset your Goalix password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your Goalix password</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #08080c; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #08080c; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" style="max-width: 480px; background-color: #0c0c12; border-radius: 16px; border: 1px solid #1a1a24; overflow: hidden;">
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <!-- Logo -->
                        <h1 style="margin: 0 0 32px 0; font-size: 28px; font-weight: 500; letter-spacing: 2px; color: #f0eef8;">
                          goalix<span style="color: #e8a857; font-weight: 300;">.</span>
                        </h1>

                        <!-- Heading -->
                        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500; color: #f0eef8;">
                          Reset your password
                        </h2>

                        <!-- Text -->
                        <p style="margin: 0 0 32px 0; font-size: 14px; line-height: 1.6; color: #8a889a;">
                          Click the button below to reset your password. This link will expire in 1 hour.
                        </p>

                        <!-- Button -->
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #e8a857; color: #08080c; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 12px;">
                          Reset Password
                        </a>

                        <!-- Security note -->
                        <p style="margin: 32px 0 0 0; font-size: 12px; color: #5a5868; line-height: 1.5;">
                          If you didn't request this email, you can safely ignore it.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Footer -->
                  <p style="margin: 24px 0 0 0; font-size: 11px; color: #5a5868;">
                    Transform your 10-year dreams into daily action
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `Reset your Goalix password\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this email, you can safely ignore it.`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("EmailIt API error:", error);
    throw new Error(`EmailIt API error: ${response.status}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_EMAIL", message: "Email is required" } },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        data: { message: "If an account exists, a password reset email has been sent" },
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in VerificationToken table (reusing NextAuth's table)
    // Delete any existing tokens for this user first
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    });

    // Create new token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: hashedToken,
        expires,
      },
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      success: true,
      data: { message: "If an account exists, a password reset email has been sent" },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process request" } },
      { status: 500 }
    );
  }
}
