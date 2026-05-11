import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ADMIN_SECRET || process.env.ADMIN_PASSWORD || "a-very-secure-secret-change-this";

function verifyAdminToken() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Helper to validate post input
function validatePost(body: any) {
  if (!body.title?.trim()) return "Title is required";
  if (!body.slug?.trim()) return "Slug is required";
  if (!body.content?.trim()) return "Content is required";
  if (body.category && typeof body.category !== "string") return "Invalid category";
  return null;
}

export async function GET() {
  if (!verifyAdminToken()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: posts, error } = await db()
      .from("posts")
      .select("id, title, slug, category, post_type, published_at")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("GET /api/admin/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminToken()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validationError = validatePost(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Generate slug if not provided (though client should provide)
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

    const { data, error } = await db()
      .from("posts")
      .insert({
        title: body.title.trim(),
        slug,
        content: body.content,
        excerpt: body.excerpt || null,
        category: body.category || "Share Price Target",
        post_type: body.post_type || "post",
        featured_image: body.featured_image || null,
        published_at: body.published_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate slug error
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Slug already exists. Please use a different title." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data });
  } catch (error: any) {
    console.error("POST /api/admin/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
