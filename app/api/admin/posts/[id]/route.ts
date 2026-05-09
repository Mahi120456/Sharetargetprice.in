import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function isAuth() {
  const token = cookies().get("admin_token")?.value;
  return token === (process.env.ADMIN_PASSWORD || "admin123");
}
function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: post } = await db().from("posts").select("*").eq("id", params.id).single();
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { error } = await db().from("posts").update({
    title: body.title, slug: body.slug, content: body.content,
    excerpt: body.excerpt, category: body.category,
    featured_image: body.featured_image || null,
    updated_at: new Date().toISOString(),
  }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await db().from("posts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
