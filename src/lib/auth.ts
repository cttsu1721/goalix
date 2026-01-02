import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import type { EmailConfig } from "next-auth/providers/email";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

// Custom EmailIt email provider
async function sendVerificationRequest({
  identifier: email,
  url,
}: Parameters<NonNullable<EmailConfig["sendVerificationRequest"]>>[0]) {
  const apiKey = process.env.EMAILIT_API_KEY;

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
      from: "Goalzenix <noreply@quantumdigitalplus.com>",
      to: email,
      reply_to: "noreply@quantumdigitalplus.com",
      subject: "Sign in to Goalzenix",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign in to Goalzenix</title>
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
                          goalzenix<span style="color: #e8a857; font-weight: 300;">.</span>
                        </h1>

                        <!-- Heading -->
                        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500; color: #f0eef8;">
                          Sign in to Goalzenix
                        </h2>

                        <!-- Text -->
                        <p style="margin: 0 0 32px 0; font-size: 14px; line-height: 1.6; color: #8a889a;">
                          Click the button below to sign in to your account. This link will expire in 24 hours.
                        </p>

                        <!-- Button -->
                        <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #e8a857; color: #08080c; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 12px;">
                          Sign in to Goalzenix
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
      text: `Sign in to Goalzenix\n\nClick the link below to sign in:\n${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this email, you can safely ignore it.`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("EmailIt API error:", error);
    throw new Error(`EmailIt API error: ${response.status}`);
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email provider (kept for password reset emails)
    {
      id: "email",
      name: "Email",
      type: "email",
      maxAge: 24 * 60 * 60, // 24 hours
      sendVerificationRequest,
    },
    // Credentials provider for email + password login
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          // User doesn't exist or hasn't set a password yet
          return null;
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Return user object (password is excluded automatically)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to dashboard
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
