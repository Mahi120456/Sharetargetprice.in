import { createClient } from '@supabase/supabase-js';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Enhanced category mapping with more meta info
const categoryMap: Record<string, { name: string; icon: string; desc: string; longDesc: string; color: string }> = {
  "share-price-target": { 
    name: "Share Price Target", 
    icon: "📈", 
    desc: "NSE/BSE stock price targets & in-depth analysis",
    longDesc: "Get expert share price targets for 3000+ NSE/BSE stocks. Detailed analysis with price predictions for 2025, 2030, 2040 & 2050.",
    color: "from-orange-500 to-red-500"
  },
  "stock-analysis": { 
    name: "Stock Analysis", 
    icon: "🔍", 
    desc: "Deep dive research on Indian stocks",
    longDesc: "Comprehensive stock analysis covering fundamentals, technicals, and growth prospects. Find multibagger opportunities.",
    color: "from-blue-500 to-cyan-500"
  },
  "ipo": { 
    name: "IPO", 
    icon: "🚀", 
    desc: "IPO reviews, GMP, and listing predictions",
    longDesc: "Latest IPO reviews, grey market premium (GMP), listing expectations, and allotment status for upcoming IPOs.",
    color: "from-purple-500 to-pink-500"
  },
  "mutual-funds": { 
    name: "Mutual Funds", 
    icon: "💼", 
    desc: "Fund performance & analysis",
    longDesc: "Analyze mutual fund performance, expense ratios, and returns. Find best funds for your investment goals.",
    color: "from-emerald-500 to-teal-500"
  },
  "sip": { 
    name: "SIP", 
    icon: "💰", 
    desc: "SIP calculators & investment planning",
    longDesc: "SIP calculators, step-up SIP, and investment planning tools. Learn how to build wealth through systematic investing.",
    color: "from-yellow-500 to-amber-500"
  },
  "calculator": { 
    name: "Calculators", 
    icon: "🧮", 
    desc: "Financial tools & calculators",
    longDesc: "Free financial calculators: SIP, EMI, CAGR, PPF, FD, RD, and more for Indian investors.",
    color: "from-indigo-500 to-purple-500"
  },
};

const POSTS_PER_PAGE = 12;
const MUTUAL_FUNDS_PER_PAGE = 12;

type Props = {
  params: { category: string };
  searchParams: { page?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryInfo = categoryMap[params.category];
  if (!categoryInfo) return { title: "Category Not Found" };
  return {
    title: `${categoryInfo.name} - ShareTargetPrice.in`,
    description: categoryInfo.longDesc,
    keywords: `${categoryInfo.name.toLowerCase()}, ${categoryInfo.name} India, ${categoryInfo.name} analysis, share market ${categoryInfo.name.toLowerCase()}`,
    openGraph: {
      title: `${categoryInfo.name} - ShareTargetPrice.in`,
      description: categoryInfo.longDesc,
      type: 'website',
    },
  };
}

// Helper: format AUM in Crores
function formatCrore(val: number) {
  if (!val) return 'N/A';
  if (val >= 10000) return `${(val / 10000).toFixed(2)} Lac Cr`;
  return `${val.toFixed(2)} Cr`;
}

// Mutual Fund Card Component (reuse same design as listing page)
function MutualFundCard({ fund }: { fund: any }) {
  const returnColor = (ret: number) => {
    if (!ret && ret !== 0) return 'text-gray-500';
    return ret >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Link
      href={`/mutual-funds/${fund.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-orange-200 transition-all block"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className="font-bold text-gray-800 group-hover:text-orange-600 line-clamp-2 text-sm md:text-base">
          {fund.scheme_name}
        </h3>
        <div className="text-xs bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
          {fund.category?.split(' ')[0] || 'Fund'}
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-3">{fund.fund_house}</div>
      <div className="grid grid-cols-2 gap-1 text-xs mb-2">
        <div>NAV: <span className="font-medium">₹{fund.nav?.toFixed(2) || 'N/A'}</span></div>
        <div>AUM: <span className="font-medium">{formatCrore(fund.aum)}</span></div>
        <div>Expense: <span className="font-medium">{fund.expense_ratio ?? 'N/A'}%</span></div>
        <div>Risk: <span className="font-medium">{fund.riskometer || 'N/A'}</span></div>
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
        <div>
          <div className="text-[10px] text-gray-400">1Y Return</div>
          <div className={`text-sm font-bold ${returnColor(fund.returns_1y)}`}>
            {fund.returns_1y != null ? `${fund.returns_1y}%` : 'N/A'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400">3Y Return</div>
          <div className={`text-sm font-bold ${returnColor(fund.returns_3y)}`}>
            {fund.returns_3y != null ? `${fund.returns_3y}%` : 'N/A'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400">5Y Return</div>
          <div className={`text-sm font-bold ${returnColor(fund.returns_5y)}`}>
            {fund.returns_5y != null ? `${fund.returns_5y}%` : 'N/A'}
          </div>
        </div>
      </div>
    </Link>
  );
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

  const currentPage = Number(searchParams.page) || 1;
  
  // ---------------------- MUTUAL FUNDS CATEGORY (special handling) ----------------------
  if (params.category === 'mutual-funds') {
    const from = (currentPage - 1) * MUTUAL_FUNDS_PER_PAGE;
    const to = from + MUTUAL_FUNDS_PER_PAGE - 1;

    // Fetch mutual funds with count
    const { data: funds, count, error } = await supabase
      .from('mutual_funds')
      .select('slug, scheme_name, fund_house, category, nav, aum, expense_ratio, returns_1y, returns_3y, returns_5y, riskometer', { count: 'exact' })
      .not('slug', 'is', null)
      .order('aum', { ascending: false })  // top AUM first
      .range(from, to);

    const totalPages = Math.ceil((count || 0) / MUTUAL_FUNDS_PER_PAGE);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Banner - same style */}
        <section className={`relative bg-gradient-to-br ${categoryInfo.color} text-white overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-black rounded-full filter blur-3xl animate-pulse delay-700"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-20">
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl md:text-7xl mb-4 animate-bounce">{categoryInfo.icon}</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                {categoryInfo.name}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-3">
                {categoryInfo.longDesc}
              </p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>{count || 0} funds available</span>
                <span className="w-px h-4 bg-white/30 mx-1"></span>
                <span>⚡ Updated daily</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08c36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#f8fafc"></path>
            </svg>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500 transition">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">{categoryInfo.name}</span>
          </nav>
        </div>

        {/* Funds Grid Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {!funds || funds.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-medium text-gray-700">No mutual funds found.</p>
              <p className="text-gray-500 mt-2">Check back soon for updated list.</p>
              <Link href="/" className="inline-block mt-6 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
                  📄 Showing <span className="font-bold text-gray-800">{funds.length}</span> of <span className="font-bold text-gray-800">{count}</span> funds
                </div>
                <div className="text-xs text-gray-400">
                  🔄 Sorted by AUM (highest first)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {funds.map((fund) => (
                  <MutualFundCard key={fund.slug} fund={fund} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-16 flex-wrap">
                  {currentPage > 1 && (
                    <Link
                      href={`/category/mutual-funds?page=${currentPage - 1}`}
                      className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm"
                    >
                      ← Previous
                    </Link>
                  )}
                  <div className="flex gap-2">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let end = Math.min(totalPages, start + maxVisible - 1);
                      if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      return pages.map(page => (
                        <Link
                          key={page}
                          href={`/category/mutual-funds?page=${page}`}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                            currentPage === page
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                          }`}
                        >
                          {page}
                        </Link>
                      ));
                    })()}
                  </div>
                  {currentPage < totalPages && (
                    <Link
                      href={`/category/mutual-funds?page=${currentPage + 1}`}
                      className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Helper Box */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Need help choosing a fund?</h3>
                <p className="text-sm text-gray-600">Compare funds, check performance, and read expert insights.</p>
              </div>
              <Link href="/mutual-funds" className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition text-sm font-medium">
                Browse All Funds →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------- OTHER CATEGORIES (posts table) ----------------------
  const categoryName = categoryInfo.name;
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data: posts, count, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image", { count: "exact" })
    .eq("category", categoryName)
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner */}
      <section className={`relative bg-gradient-to-br ${categoryInfo.color} text-white overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-black rounded-full filter blur-3xl animate-pulse delay-700"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl md:text-7xl mb-4 animate-bounce">{categoryInfo.icon}</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
              {categoryInfo.name}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-3">
              {categoryInfo.longDesc}
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>{count || 0} articles available</span>
              <span className="w-px h-4 bg-white/30 mx-1"></span>
              <span>⚡ Updated daily</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08c36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#f8fafc"></path>
          </svg>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-orange-500 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{categoryInfo.name}</span>
        </nav>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!posts || posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-medium text-gray-700">No posts in this category yet.</p>
            <p className="text-gray-500 mt-2">Check back soon for fresh updates.</p>
            <Link href="/" className="inline-block mt-6 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
                📄 Showing <span className="font-bold text-gray-800">{posts.length}</span> of <span className="font-bold text-gray-800">{count}</span> results
              </div>
              <div className="text-xs text-gray-400">
                🔄 Sorted by latest first
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-16 flex-wrap">
                {currentPage > 1 && (
                  <Link
                    href={`/category/${params.category}?page=${currentPage - 1}`}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm"
                  >
                    ← Previous
                  </Link>
                )}
                <div className="flex gap-2">
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let end = Math.min(totalPages, start + maxVisible - 1);
                    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    return pages.map(page => (
                      <Link
                        key={page}
                        href={`/category/${params.category}?page=${page}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                          currentPage === page
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                        }`}
                      >
                        {page}
                      </Link>
                    ));
                  })()}
                </div>
                {currentPage < totalPages && (
                  <Link
                    href={`/category/${params.category}?page=${currentPage + 1}`}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Looking for something specific?</h3>
              <p className="text-sm text-gray-600">Use our search or browse stocks alphabetically.</p>
            </div>
            <Link href="/all-stocks" className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition text-sm font-medium">
              Browse All Stocks →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
