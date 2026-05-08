import { supabase } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

type Props = {
  params: { category: string };
};

const categoryNames: Record<string, string> = {
  "share-price-target": "Share Price Target",
  "stock-analysis": "Stock Analysis",
  "ipo": "IPO",
  "mutual-funds": "Mutual Funds",
  "sip": "SIP",
  "calculator": "Calculator",
};

async function getPostsByCategory(categorySlug: string) {
  const categoryName = categoryNames[categorySlug] || categorySlug;
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image")
    .eq("category", categoryName)
    .order("published_at", { ascending: false })
    .limit(24);

  if (error) return [];
  return data || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = categoryNames[params.category] || params.category;
  return {
    title: `${name} – ShareTargetPrice.in`,
    description: `Latest ${name} articles, analysis and insights for Indian stock market investors.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const posts = await getPostsByCategory(params.category);
  const categoryName = categoryNames[params.category] || params.category;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl p-8 mb-8">
        <h1 className="text-3xl font-black mb-2">{categoryName}</h1>
        <p className="text-gray-300">
          {posts.length} article{posts.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <div className="text-4xl mb-4">📂</div>
          <p className="text-lg font-medium">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
