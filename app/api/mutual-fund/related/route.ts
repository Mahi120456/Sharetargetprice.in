import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const excludeSlug = searchParams.get('exclude');

  if (!category) {
    return NextResponse.json({ error: 'Category missing' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('mutual_funds')
    .select('slug, scheme_name, category, returns_3y, nav')
    .eq('category', category)
    .neq('slug', excludeSlug || '')
    .limit(6);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}
