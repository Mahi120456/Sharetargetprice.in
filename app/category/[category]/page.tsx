import { createClient } from '@supabase/supabase-js';
import Link from "next/link";

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

export default async function CategoryPage({ params }: Props) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const categoryName = categoryNames[params.category] || params.category;

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at")
    .eq("category", categoryName)
    .eq("post_type", "post")
    .order("published_at", { ascending: false })
    .limit(24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl p-8 mb-8">
        <h1 className="text-3xl font-black mb-2">{categoryName}</h1>
        <p className="text-gray-300">{posts?.length || 0} articles available</p>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <div className="text-4xl mb-4">📂</div>
          <p className="text-lg font-medium">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/${post.slug}`}>
              <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all h-full">
                <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  {post.category}
                </span>
                <h2 className="font-bold text-slate-900 mt-3 mb-2 line-clamp-3 hover:text-orange-600">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                <p className="text-xs text-gray-400 mt-3">
                  📅 {new Date(post.published_at).toLocaleDateString("en-IN")}
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
