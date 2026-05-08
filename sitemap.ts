import { supabase } from "@/lib/supabase";

export default async function sitemap() {
  const baseUrl = "https://sharetargetprice.in";

  // Get all posts
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, published_at, updated_at")
    .eq("post_type", "post")
    .order("published_at", { ascending: false });

  const postUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/category/share-price-target`, priority: 0.9 },
    { url: `${baseUrl}/category/stock-analysis`, priority: 0.9 },
    { url: `${baseUrl}/category/ipo`, priority: 0.8 },
    { url: `${baseUrl}/category/sip`, priority: 0.8 },
    { url: `${baseUrl}/category/calculator`, priority: 0.8 },
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
  }));

  return [...staticPages, ...postUrls];
}
