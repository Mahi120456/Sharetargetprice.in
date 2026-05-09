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

export async function GET() {
  if (!isAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: posts } = await db().from("posts")
    .select("id, title, slug, category, post_type, published_at")
    .order("published_at", { ascending: false });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  if (!isAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { data, error } = await db().from("posts").insert({
    title: body.title, slug: body.slug, content: body.content,
    excerpt: body.excerpt, category: body.category,
    post_type: body.post_type || "post",
    featured_image: body.featured_image || null,
    published_at: body.published_at || new Date().toISOString(),
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, post: data });
}
