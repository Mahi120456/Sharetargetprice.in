import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";
import MarketMovers from "@/components/MarketMovers";
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Share Target Price – India's Smart Stock Research Platform",
  description: "Stock analysis, IPO GMP, mutual fund research, calculators & share price targets – all free.",
};

// ------------------------------------------------------------------
// Helper: Popular Stocks (static list, could be fetched from DB)
const popularStocks = [
  { name: "RVNL", slug: "rvnl", priceTarget: "₹120", change: "+8%" },
  { name: "BEL", slug: "bel", priceTarget: "₹340", change: "+5%" },
  { name: "Tata Motors", slug: "tata-motors", priceTarget: "₹980", change: "+12%" },
  { name: "IRFC", slug: "irfc", priceTarget: "₹220", change: "+3%" },
  { name: "Suzlon", slug: "suzlon", priceTarget: "₹55", change: "+15%" },
  { name: "HAL", slug: "hal", priceTarget: "₹4300", change: "+7%" },
  { name: "BHEL", slug: "bhel", priceTarget: "₹310", change: "+4%" },
  { name: "NTPC", slug: "ntpc", priceTarget: "₹410", change: "+2%" },
];

// ------------------------------------------------------------------
// Share Price Target Hub Data
const targetHub = [
  { stock: "RVNL", targets: { 2026: "₹165", 2027: "₹210", 2030: "₹350" }, slug: "rvnl" },
  { stock: "BEL", targets: { 2026: "₹420", 2027: "₹520", 2030: "₹850" }, slug: "bel" },
  { stock: "Suzlon", targets: { 2026: "₹85", 2027: "₹120", 2030: "₹220" }, slug: "suzlon" },
];

// ------------------------------------------------------------------
// IPOs (fetch from database)
async function getIPOData() {
  const { data: upcoming } = await supabase
    .from('ipos')
    .select('*')
    .eq('status', 'upcoming')
    .order('open_date', { ascending: true })
    .limit(3);

  const { data: current } = await supabase
    .from('ipos')
    .select('*')
    .eq('status', 'current')
    .order('close_date', { ascending: true })
    .limit(3);

  const { data: recent } = await supabase
    .from('ipos')
    .select('*')
    .eq('status', 'listed')
    .order('listing_date', { ascending: false })
    .limit(3);

  return { upcoming, current, recent };
}

// ------------------------------------------------------------------
// Financial Calculators – static list (links)
const calculators = [
  { name: "SIP Calculator", slug: "sip-calculator", icon: "💰" },
  { name: "EMI Calculator", slug: "emi-calculator", icon: "🏠" },
  { name: "FD Calculator", slug: "fd-calculator", icon: "🏦" },
  { name: "CAGR Calculator", slug: "cagr-calculator", icon: "📈" },
  { name: "SWP Calculator", slug: "swp-calculator", icon: "💸" },
  { name: "Retirement Calculator", slug: "retirement-calculator", icon: "👵" },
];

// ------------------------------------------------------------------
// Mutual Fund Categories
const mfCategories = [
  { name: "Flexi Cap", slug: "flexi-cap", icon: "🎯" },
  { name: "Small Cap", slug: "small-cap", icon: "📈" },
  { name: "Index Funds", slug: "index-funds", icon: "📊" },
  { name: "ELSS Funds", slug: "elss", icon: "💰" },
];

// ------------------------------------------------------------------
// Learn Section Articles
const learnArticles = [
  { title: "How to Start Investing", slug: "how-to-start-investing" },
  { title: "SIP vs FD – Which is Better?", slug: "sip-vs-fd" },
  { title: "Best Mutual Funds for 2026", slug: "best-mutual-funds-2026" },
  { title: "IPO Investing Guide", slug: "ipo-investing-guide" },
];

// ------------------------------------------------------------------
// Stats
const stats = [
  { value: "3000+", label: "Stocks Covered", icon: "📈" },
  { value: "50+", label: "IPOs Analyzed", icon: "🚀" },
  { value: "55+", label: "Financial Calculators", icon: "🧮" },
  { value: "500+", label: "Mutual Funds", icon: "💰" },
];

// ------------------------------------------------------------------
// Helper to get mutual funds from CSV (same as before)
async function getMutualFundsFromCSV(limit = 4) {
  const funds: any[] = [];
  const filePath = path.join(process.cwd(), 'data', '500_mutual_funds_PHASE6_INSTITUTIONAL.csv');
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (funds.length >= limit) return;
        let slug = row.scheme_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (slug) funds.push({ slug, scheme_name: row.scheme_name, returns_3y: parseFloat(row.returns_3y) || null, fund_house: row.fund_house });
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
  return funds;
}

// ------------------------------------------------------------------
// Component: Fund Card (small)
function FundCardMini({ fund }: { fund: any }) {
  return (
    <Link href={`/mutual-funds/${fund.slug}`} className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition border border-gray-100">
      <h3 className="font-semibold text-sm line-clamp-1">{fund.scheme_name}</h3>
      <p className="text-xs text-gray-500">{fund.fund_house}</p>
      <p className="text-green-600 text-sm font-bold mt-1">{fund.returns_3y ? `${fund.returns_3y}%` : 'N/A'}</p>
    </Link>
  );
}

// ------------------------------------------------------------------
export default async function Home() {
  const { upcoming, current, recent } = await getIPOData();
  const topMutualFunds = await getMutualFundsFromCSV(4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* ========== SECTION 1: HERO + SEARCH ========== */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            India's Smart Stock Research Platform
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Analyze Stocks, IPOs, Mutual Funds & Financial Calculators in One Place.
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Stocks... e.g., Tata Motors, RVNL, BEL, Suzlon..."
                className="w-full px-5 py-4 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xl"
              />
              <button className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold transition">
                Search
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link href="/all-stocks" className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm hover:bg-white/20">📈 Stock Analysis</Link>
              <Link href="/share-price-target" className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm hover:bg-white/20">🎯 Share Price Targets</Link>
              <Link href="/ipo" className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm hover:bg-white/20">🚀 IPO Center</Link>
              <Link href="/mutual-funds" className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm hover:bg-white/20">💰 Mutual Funds</Link>
              <Link href="/calculator" className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm hover:bg-white/20">🧮 Calculators</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: POPULAR STOCKS ========== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🔥 Trending Stocks</h2>
          <Link href="/all-stocks" className="text-orange-500 text-sm font-semibold hover:underline">View Full Analysis →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {popularStocks.map((stock) => (
            <Link key={stock.slug} href={`/stock/${stock.slug}-share-price-target`} className="bg-white rounded-xl p-3 text-center shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="font-bold text-gray-800">{stock.name}</div>
              <div className="text-sm text-gray-500">{stock.priceTarget}</div>
              <div className="text-xs text-green-600">{stock.change}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== SECTION 3: SHARE PRICE TARGET HUB ========== */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🎯 Share Price Target Hub</h2>
            <Link href="/all-stocks" className="text-orange-500 text-sm font-semibold hover:underline">View All Targets →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow">
              <thead className="bg-gray-50">
                <tr><th className="p-3 text-left">Stock</th><th>2026</th><th>2027</th><th>2030</th></tr></thead>
              <tbody>
                {targetHub.map((item) => (
                  <tr key={item.stock} className="border-t">
                    <td className="p-3 font-medium"><Link href={`/stock/${item.slug}-share-price-target`} className="hover:text-orange-600">{item.stock}</Link></td>
                    <td className="text-green-600 font-semibold">{item.targets[2026]}</td>
                    <td className="text-green-600 font-semibold">{item.targets[2027]}</td>
                    <td className="text-green-600 font-semibold">{item.targets[2030]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: IPO CENTER ========== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">🚀 IPO Hub</h2>
          <Link href="/ipo" className="text-orange-500 text-sm font-semibold hover:underline">Explore IPO Center →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-lg mb-3">📅 Upcoming IPOs</h3>
            {upcoming?.length ? upcoming.map(ipo => <div key={ipo.id} className="mb-2"><Link href={`/ipo/${ipo.slug}`} className="font-medium hover:text-orange-600">{ipo.company_name}</Link><p className="text-xs text-gray-500">Open: {new Date(ipo.open_date).toLocaleDateString()}</p></div>) : <p className="text-gray-400">No upcoming IPOs</p>}
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-lg mb-3">🟢 Open IPOs</h3>
            {current?.length ? current.map(ipo => <div key={ipo.id} className="mb-2"><Link href={`/ipo/${ipo.slug}`} className="font-medium hover:text-orange-600">{ipo.company_name}</Link><p className="text-xs text-gray-500">GMP: ₹{ipo.gmp || '-'}</p></div>) : <p className="text-gray-400">No open IPOs</p>}
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-lg mb-3">📊 Recently Listed</h3>
            {recent?.length ? recent.map(ipo => <div key={ipo.id} className="mb-2"><Link href={`/ipo/${ipo.slug}`} className="font-medium hover:text-orange-600">{ipo.company_name}</Link><p className="text-xs text-green-600">Listing Gain: {ipo.listing_price && ipo.price_band ? `${((ipo.listing_price - parseInt(ipo.price_band.split('-')[1]))/parseInt(ipo.price_band.split('-')[1])*100).toFixed(0)}%` : '-'}</p></div>) : <p className="text-gray-400">No recent listings</p>}
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: FINANCIAL CALCULATORS ========== */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🧮 Financial Calculators</h2>
            <Link href="/calculator" className="text-orange-500 text-sm font-semibold hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {calculators.map(calc => (
              <Link key={calc.slug} href={`/calculator/${calc.slug}`} className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition border">
                <div className="text-3xl mb-2">{calc.icon}</div>
                <div className="font-medium text-sm">{calc.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 6: MUTUAL FUND RESEARCH ========== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">💰 Mutual Fund Research</h2>
          <Link href="/mutual-funds" className="text-orange-500 text-sm font-semibold hover:underline">Explore Funds →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {topMutualFunds.map(fund => <FundCardMini key={fund.slug} fund={fund} />)}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          {mfCategories.map(cat => <Link key={cat.slug} href={`/mutual-funds/best/${cat.slug}`} className="bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-orange-100 transition">{cat.icon} {cat.name}</Link>)}
        </div>
      </section>

      {/* ========== SECTION 7: MARKET MOVERS ========== */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Today's Market Movers</h2>
          <MarketMovers />
        </div>
      </section>

      {/* ========== SECTION 8: LEARN INVESTING ========== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Learn Investing</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {learnArticles.map(article => (
            <Link key={article.slug} href={`/${article.slug}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border">
              <div className="font-semibold text-gray-800">{article.title}</div>
              <div className="text-xs text-gray-400 mt-1">Read →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== SECTION 9: WHY TRUST US ========== */}
      <section className="bg-gradient-to-r from-orange-50 to-amber-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Trust Share Target Price?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-orange-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA (optional) – same as existing but kept minimal */}
      <section className="py-12 text-center">
        <Link href="/all-stocks" className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-orange-600 transition">
          📈 Start Exploring Stocks →
        </Link>
      </section>
    </div>
  );
}
