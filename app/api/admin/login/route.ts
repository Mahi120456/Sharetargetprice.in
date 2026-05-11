import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

// Use a strong secret from environment variables (fallback only for development)
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || process.env.ADMIN_PASSWORD || "a-very-secure-secret-change-this";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Rate limiting simple in-memory (for serverless, better to use Redis; but this works for low traffic)
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // attempts per 15 minutes

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const limit = rateLimits.get(ip);
  if (limit && limit.resetTime > now && limit.count >= RATE_LIMIT) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const { password } = await req.json();
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password required" },
        { status: 400 }
      );
    }

    // Verify password
    if (password !== ADMIN_PASSWORD) {
      // Update rate limit
      if (!limit || limit.resetTime < now) {
        rateLimits.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
      } else {
        limit.count++;
      }
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { authenticated: true, iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Clear rate limit on success
    rateLimits.delete(ip);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
