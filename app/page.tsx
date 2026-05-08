import { supabase } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShareTargetPrice.in – Share Price Target & Stock Market Analysis",
  description:
    "Get accurate share price targets for NSE & BSE listed stocks. Analysis of IRFC, RVNL, Suzlon, HDFC Bank and more. SIP calculators and investment tools.",
};

async function getLatestPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image")
    .eq("post_type", "post")
    .order("published_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data || [];
}

const categories = [
  { name: "Share Price Target", slug: "share-price-target", icon: "📈", desc: "Stock price analysis" },
  { name: "Stock Analysis", slug: "stock-analysis", icon: "🔍", desc: "Deep dive research" },
  { name: "IPO", slug: "ipo", icon: "🚀", desc: "New listings review" },
  { name: "Mutual Funds", slug: "mutual-funds", icon: "💼", desc: "Fund analysis" },
  { name: "SIP", slug: "sip", icon: "💰", desc: "SIP planning tools" },
  { name: "Calculators", slug: "calculator", icon: "🧮", desc: "Financial tools" },
];

export default async function Home() {
  const posts = await getLatestPosts();

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            🇮🇳 India&apos;s #1 Stock Analysis Platform
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            Share Price Target
            <span className="text-orange-400"> Analysis</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Data-driven stock analysis, share price targets aur investment insights 
            for Indian retail investors. NSE & BSE ke sab stocks ki jaankari.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/category/share-price-target"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              📈 Latest Targets
            </Link>
            <Link
              href="/category/calculator"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg transition-colors border border-white/20"
            >
              🧮 Calculators
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-semibold text-sm text-slate-800 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">{cat.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Latest Analysis
          </h2>
          <Link
            href="/category/share-price-target"
            className="text-orange-500 text-sm font-semibold hover:text-orange-600"
          >
            View All →
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium">Posts loading...</p>
            <p className="text-sm mt-2">Please run the import script first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-orange-400">500+</div>
            <div className="text-sm text-gray-400 mt-1">Stocks Covered</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-400">50+</div>
            <div className="text-sm text-gray-400 mt-1">Calculators</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-400">10L+</div>
            <div className="text-sm text-gray-400 mt-1">Monthly Readers</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-400">Free</div>
            <div className="text-sm text-gray-400 mt-1">Always</div>
          </div>
        </div>
      </section>
    </div>
  );
}
