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

// Helper to validate post update input
function validatePostUpdate(body: any) {
  if (body.title !== undefined && !body.title.trim()) return "Title cannot be empty";
  if (body.slug !== undefined && !body.slug.trim()) return "Slug cannot be empty";
  if (body.content !== undefined && !body.content.trim()) return "Content cannot be empty";
  return null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminToken()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: post, error } = await db()
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("GET /api/admin/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminToken()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validationError = validatePostUpdate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Build update object dynamically (only provided fields)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.featured_image !== undefined) updateData.featured_image = body.featured_image;
    if (body.post_type !== undefined) updateData.post_type = body.post_type;

    const { error } = await db()
      .from("posts")
      .update(updateData)
      .eq("id", params.id);

    if (error) {
      // Handle duplicate slug error
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Slug already exists. Please use a different one." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/admin/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminToken()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { error } = await db()
      .from("posts")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
