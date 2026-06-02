import { supabase } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import type { Metadata } from "next";
import MarketMovers from "@/components/MarketMovers";
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Share Target Price – India's #1 Share Price Target Analysis Platform",
  description: "Accurate share price targets for 500+ NSE/BSE stocks. Long-term forecasts, live charts, fundamentals, and expert analysis for Indian investors.",
  keywords: "share target price, stock price target, nse target price, bse target price, stock analysis, indian stock market, nifty 50 targets",
  authors: [{ name: "Share Target Price Team" }],
  openGraph: {
    title: "Share Target Price – India's #1 Share Price Target Analysis Platform",
    description: "Get accurate share price targets for 500+ Indian stocks. Long-term forecasts, charts, and fundamental analysis.",
    url: "https://sharetargetprice.in",
    siteName: "Share Target Price",
    images: [{ url: "https://sharetargetprice.in/og-image.jpg", width: 1200, height: 630, alt: "Share Target Price – India's #1 Stock Price Forecast Platform" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Target Price – Stock Price Forecasts",
    description: "Accurate share price targets for Indian stocks.",
    images: ["https://sharetargetprice.in/og-image.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  alternates: { canonical: "https://sharetargetprice.in" },
};

const categoriesFromPosts = [
  { name: "Share Price Target", slug: "share-price-target", icon: "📈", desc: "Stock price analysis", color: "from-orange-500 to-red-500" },
  { name: "Stock Analysis", slug: "stock-analysis", icon: "🔍", desc: "Deep dive research", color: "from-blue-500 to-cyan-500" },
  { name: "IPO", slug: "ipo", icon: "🚀", desc: "New listings review", color: "from-purple-500 to-pink-500" },
  { name: "SIP", slug: "sip", icon: "💰", desc: "SIP planning tools", color: "from-yellow-500 to-amber-500" },
];

async function getPostsByCategory(categoryName: string, limit = 4) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image")
    .eq("category", categoryName)
    .in("post_type", ["post", "page"])
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

async function getCalculatorsForHome(limit = 4) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image")
    .in("category", ["Calculator", "SIP"])
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

async function getLatestCalculators(limit = 6) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image")
    .in("category", ["Calculator", "SIP"])
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

// ✅ Mutual Funds data directly from CSV (guaranteed)
async function getMutualFundsFromCSV(limit = 4) {
  const funds: any[] = [];
  const filePath = path.join(process.cwd(), 'data', '500_mutual_funds_PHASE6_INSTITUTIONAL.csv');
  
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (funds.length >= limit) return;
        let slug = row.scheme_name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (slug) {
          funds.push({
            slug,
            scheme_name: row.scheme_name,
            fund_house: row.fund_house,
            category: row.category,
            nav: parseFloat(row.nav) || null,
            aum: parseFloat(row.aum) || null,
            expense_ratio: parseFloat(row.expense_ratio) || null,
            returns_1y: parseFloat(row.returns_1y) || null,
            returns_3y: parseFloat(row.returns_3y) || null,
            returns_5y: parseFloat(row.returns_5y) || null,
            riskometer: row.riskometer || null,
          });
        }
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
  return funds;
}

function formatCrore(val: number) {
  if (!val) return 'N/A';
  if (val >= 10000) return `${(val / 10000).toFixed(2)} Lac Cr`;
  return `${val.toFixed(2)} Cr`;
}

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

export default async function Home() {
  // Fetch data from posts table for other categories
  const categoriesData = await Promise.all(
    categoriesFromPosts.map(async (cat) => ({
      ...cat,
      posts: await getPostsByCategory(cat.name, 4),
    }))
  );
  const calculatorsForHome = await getCalculatorsForHome(4);
  const latestCalculators = await getLatestCalculators(6);
  // ✅ Mutual funds fetched directly from CSV – guaranteed 4 funds
  const mutualFundsForCategory = await getMutualFundsFromCSV(4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Share Target Price",
    "url": "https://sharetargetprice.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://sharetargetprice.in/all-stocks?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "description": "Accurate share price targets for 500+ Indian stocks. Long-term forecasts, charts, and fundamental analysis."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
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
                Data-driven share price targets for 3000+ NSE & BSE stocks. Expert analysis, long-term forecasts, and financial tools for Indian investors.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/all-stocks" className="group bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                  <span>🔍</span> Explore 3000+ Stocks
                </Link>
                <Link href="/mutual-funds" className="group bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                  <span>💼</span> Mutual Funds
                </Link>
                <Link href="/category/sip" className="group bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                  <span>💰</span> SIP Calculator
                </Link>
                <Link href="/category/ipo" className="group bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                  <span>🚀</span> IPO Analysis
                </Link>
                <Link href="/calculator" className="group bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
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

        {/* A-Z Directory */}
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

        {/* Market Movers */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">📊 Today's Market Movers</h2>
              <p className="text-gray-500 mt-1">Real‑time top gainers & losers from NSE/BSE</p>
            </div>
            <MarketMovers />
          </div>
        </section>

        {/* Category Sections (Share Price Target, Stock Analysis, IPO, SIP) */}
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
          {categoriesData.map(({ name, slug, icon, desc, color, posts }) => (
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
                {/* ✅ FIX: SIP View All now points to /category/sip instead of /calculator */}
                <Link href={name === "SIP" ? `/category/${slug}` : (name === "SIP" ? "/calculator" : `/category/${slug}`)} className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100">
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
                  {posts.map((post) => <PostCard key={post.id} post={post} />)}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* ========== MUTUAL FUNDS SECTION (CSV guaranteed) ========== */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <section className="scroll-mt-20">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl shadow-md">
                  💼
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mutual Funds</h2>
                  <p className="text-sm text-gray-500">Fund analysis & performance</p>
                </div>
              </div>
              <Link href="/mutual-funds" className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100">
                View All →
              </Link>
            </div>
            {mutualFundsForCategory.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
                <div className="text-4xl mb-2">📭</div>
                <p>No mutual funds data available. Please check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mutualFundsForCategory.map((fund) => (
                  <MutualFundCard key={fund.slug} fund={fund} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Calculators Category Section */}
        {calculatorsForHome.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <section className="scroll-mt-20">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-md">
                    🧮
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Calculators</h2>
                    <p className="text-sm text-gray-500">Financial tools</p>
                  </div>
                </div>
                <Link href="/calculator" className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {calculatorsForHome.map((calc) => <PostCard key={calc.id} post={calc} />)}
              </div>
            </section>
          </div>
        )}

        {/* Free Calculators Showcase */}
        {latestCalculators.length > 0 && (
          <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Free Financial Calculators</h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-10">Plan your investments with our easy-to-use financial tools</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {latestCalculators.slice(0,6).map((calc) => (
                  <Link key={calc.id} href={`/calculator/${calc.slug}`} className="group">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                      <div className="text-3xl mb-2">🧮</div>
                      <div className="font-semibold text-sm line-clamp-2 group-hover:text-orange-300">{calc.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/calculator" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                  View All 50+ Calculators →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Stats Bar */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-4xl font-black text-orange-500">3000+</div><div className="text-gray-600 text-sm">Stock Targets</div></div>
            <div><div className="text-4xl font-black text-orange-500">50+</div><div className="text-gray-600 text-sm">Calculators</div></div>
            <div><div className="text-4xl font-black text-orange-500">10L+</div><div className="text-gray-600 text-sm">Monthly Readers</div></div>
            <div><div className="text-4xl font-black text-orange-500">FREE</div><div className="text-gray-600 text-sm">Always Access</div></div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Investment Journey Today</h2>
            <p className="text-orange-100 mb-8 text-lg">Get expert share price targets, analysis, and financial tools – completely free.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/all-stocks" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                📈 Explore All Stocks →
              </Link>
              <Link href="/mutual-funds" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-white/30 transition-all">
                💼 Mutual Funds
              </Link>
              <Link href="/category/ipo" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-white/30 transition-all">
                🚀 IPOs
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
