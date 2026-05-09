import { createClient } from '@supabase/supabase-js';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Category mapping (slug -> display name + icon)
const categoryMap: Record<string, { name: string; icon: string; desc: string }> = {
  "share-price-target": { name: "Share Price Target", icon: "📈", desc: "NSE/BSE stock price targets & in-depth analysis" },
  "stock-analysis": { name: "Stock Analysis", icon: "🔍", desc: "Deep dive research on Indian stocks" },
  "ipo": { name: "IPO", icon: "🚀", desc: "IPO reviews, GMP, and listing predictions" },
  "mutual-funds": { name: "Mutual Funds", icon: "💼", desc: "Fund performance & analysis" },
  "sip": { name: "SIP", icon: "💰", desc: "SIP calculators & investment planning" },
  "calculator": { name: "Calculators", icon: "🧮", desc: "Financial tools & calculators" },
};

const POSTS_PER_PAGE = 12;

type Props = {
  params: { category: string };
  searchParams: { page?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryInfo = categoryMap[params.category];
  if (!categoryInfo) return { title: "Category Not Found" };
  return {
    title: `${categoryInfo.name} - ShareTargetPrice.in`,
    description: categoryInfo.desc,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const categoryInfo = categoryMap[params.category];
  if (!categoryInfo) {
    notFound();
  }

  const categoryName = categoryInfo.name;
  const currentPage = Number(searchParams.page) || 1;
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  // Fetch posts with count
  const { data: posts, count, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image", { count: "exact" })
    .eq("category", categoryName)
    .eq("post_type", "post")
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner for Category */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-orange-800 text-white py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="text-5xl mb-4">{categoryInfo.icon}</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {categoryInfo.name}
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            {categoryInfo.desc}
          </p>
          <div className="text-sm text-orange-300 mt-3">
            {count || 0} articles available
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {!posts || posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-medium">No posts in this category yet.</p>
            <p className="text-sm mt-2">Check back soon for updates.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12 flex-wrap">
                {currentPage > 1 && (
                  <Link
                    href={`/category/${params.category}?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-orange-50 hover:border-orange-200 transition"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/category/${params.category}?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-orange-50 hover:border-orange-200 transition"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
