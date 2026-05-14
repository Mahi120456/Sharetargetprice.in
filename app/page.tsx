import { supabase } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import type { Metadata } from "next";
import MarketMovers from "@/components/MarketMovers";   // 👈 Dynamic market movers

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "ShareTargetPrice.in – Share Price Target & Stock Market Analysis",
  description: "Get accurate share price targets for 3000+ NSE & BSE listed stocks...",
  keywords: "share price target, stock analysis, NSE BSE, Indian stocks...",
  openGraph: {
    title: "ShareTargetPrice.in – Share Price Target & Stock Market Analysis",
    description: "Expert share price targets and analysis for Indian stocks.",
    type: "website",
    url: "https://sharetargetprice.in",
    siteName: "ShareTargetPrice.in",
  },
};

// Categories for homepage
const featuredCategories = [
  { name: "Share Price Target", slug: "share-price-target", icon: "📈", desc: "Stock price analysis", color: "from-orange-500 to-red-500" },
  { name: "Stock Analysis", slug: "stock-analysis", icon: "🔍", desc: "Deep dive research", color: "from-blue-500 to-cyan-500" },
  { name: "IPO", slug: "ipo", icon: "🚀", desc: "New listings review", color: "from-purple-500 to-pink-500" },
  { name: "Mutual Funds", slug: "mutual-funds", icon: "💼", desc: "Fund analysis", color: "from-emerald-500 to-teal-500" },
  { name: "SIP", slug: "sip", icon: "💰", desc: "SIP planning tools", color: "from-yellow-500 to-amber-500" },
  { name: "Calculators", slug: "calculator", icon: "🧮", desc: "Financial tools", color: "from-indigo-500 to-purple-500" },
];

async function getPostsByCategory(categoryName: string, limit = 4) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image")
    .eq("category", categoryName)
    .eq("post_type", "post")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error(`Error fetching ${categoryName}:`, error);
    return [];
  }
  return data || [];
}

async function getLatestCalculators(limit = 6) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, featured_image")
    .eq("category", "Calculator")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

export default async function Home() {
  const categoriesWithPosts = await Promise.all(
    featuredCategories.map(async (cat) => ({
      ...cat,
      posts: await getPostsByCategory(cat.name, 4),
    }))
  );

  const latestCalculators = await getLatestCalculators(6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* ========== HERO SECTION ========== */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* (Keep your existing hero section exactly as it was) */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              🇮🇳 India's #1 Stock Analysis Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
              Share Price Target
              <span className="text-orange-400 block mt-2">Analysis & Predictions</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Data-driven share price targets for 3000+ NSE & BSE stocks. 
              Expert analysis, long-term forecasts, and financial tools for Indian investors.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/all-stocks" className="group bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                <span>🔍</span> Explore 3000+ Stocks
                <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
              <Link href="/category/calculator" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl transition-all border border-white/20 flex items-center gap-2">
                <span>🧮</span> Financial Calculators
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08c36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#f8fafc"></path>
          </svg>
        </div>
      </section>

      {/* ========== STOCK DIRECTORY A-Z SECTION ========== */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Browse by Company Name</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Click any letter to view stock price targets...</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <Link key={letter} href={`/all-stocks?letter=${letter}`} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm hover:shadow-md">
                {letter}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TODAY'S MARKET MOVERS (Dynamic) ========== */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">📊 Today's Market Movers</h2>
            <p className="text-gray-500 mt-1">Real‑time top gainers & losers from NSE/BSE</p>
          </div>
          <MarketMovers />
        </div>
      </section>

      {/* ========== CATEGORY WISE SECTIONS ========== */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {categoriesWithPosts.map(({ name, slug, icon, desc, color, posts }) => (
          <section key={slug} className="scroll-mt-20">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl shadow-md`}>
                  {icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
              <Link href={`/category/${slug}`} className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100">
                View All →
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
                <div className="text-4xl mb-2">📭</div>
                <p>No posts in {name} yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* ========== CALCULATORS SHOWCASE ========== */}
      {latestCalculators.length > 0 && (
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Free Financial Calculators</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">Plan your investments with our easy-to-use financial tools</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {latestCalculators.slice(0, 6).map((calc) => (
                <Link key={calc.id} href={`/calculator/${calc.slug}`} className="group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                    <div className="text-3xl mb-2">🧮</div>
                    <div className="font-semibold text-sm line-clamp-2 group-hover:text-orange-300 transition">
                      {calc.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/category/calculator" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                View All 50+ Calculators →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========== STATS BAR ========== */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><div className="text-4xl font-black text-orange-500">3000+</div><div className="text-gray-600 text-sm mt-1">Stock Targets</div></div>
          <div><div className="text-4xl font-black text-orange-500">50+</div><div className="text-gray-600 text-sm mt-1">Calculators</div></div>
          <div><div className="text-4xl font-black text-orange-500">10L+</div><div className="text-gray-600 text-sm mt-1">Monthly Readers</div></div>
          <div><div className="text-4xl font-black text-orange-500">FREE</div><div className="text-gray-600 text-sm mt-1">Always Access</div></div>
        </div>
      </section>

      {/* ========== CALL TO ACTION ========== */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Investment Journey Today</h2>
          <p className="text-orange-100 mb-8 text-lg">Get expert share price targets, analysis, and financial tools – completely free.</p>
          <Link href="/all-stocks" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            🔍 Explore All Stocks <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
