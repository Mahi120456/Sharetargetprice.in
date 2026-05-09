import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (password === adminPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", adminPassword, {
      httpOnly: true, secure: true,
      maxAge: 60 * 60 * 24 * 7, path: "/",
    });
    return response;
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
