import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Mutual Funds in India – Complete List 2026 | NAV, Returns, AUM',
  description: 'Explore complete list of 500+ mutual funds in India. Compare NAV, returns (1Y/3Y/5Y), AUM, expense ratio, riskometer, and more. Updated daily.',
  keywords: 'mutual funds list, best mutual funds India, NAV, returns, AUM, expense ratio, large cap, mid cap, small cap, elss',
  openGraph: {
    title: 'All Mutual Funds in India – Complete List',
    description: 'Compare mutual funds by returns, AUM, NAV, and riskometer.',
    type: 'website',
  },
};

// Categories from your data (based on CSV)
const fundCategories = [
  { name: 'Large Cap', slug: 'large-cap', icon: '🏦', keywords: ['large cap', 'bluechip'] },
  { name: 'Mid Cap', slug: 'mid-cap', icon: '📊', keywords: ['mid cap'] },
  { name: 'Small Cap', slug: 'small-cap', icon: '📈', keywords: ['small cap'] },
  { name: 'Multi Cap', slug: 'multi-cap', icon: '🔄', keywords: ['multi cap'] },
  { name: 'ELSS', slug: 'elss', icon: '💰', keywords: ['elss', 'tax saver'] },
  { name: 'Flexi Cap', slug: 'flexi-cap', icon: '🎯', keywords: ['flexi cap'] },
  { name: 'Hybrid', slug: 'hybrid', icon: '⚖️', keywords: ['hybrid', 'balanced'] },
  { name: 'Debt', slug: 'debt', icon: '🔒', keywords: ['debt', 'banking and psu'] },
  { name: 'Liquid', slug: 'liquid', icon: '💧', keywords: ['liquid'] },
  { name: 'Thematic', slug: 'thematic', icon: '🎨', keywords: ['infra', 'pharma', 'auto', 'banking', 'technology'] },
  { name: 'Technology', slug: 'technology', icon: '💻', keywords: ['technology', 'it'] },
  { name: 'Sectoral', slug: 'sectoral', icon: '🏭', keywords: ['banking', 'pharma', 'auto', 'infrastructure'] },
];

async function getAllMutualFunds() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mutual_funds')
    .select('scheme_name, slug, fund_house, category, nav, aum, returns_1y, returns_3y, returns_5y, expense_ratio, riskometer')
    .not('slug', 'is', null)
    .order('aum', { ascending: false });  // Top AUM first

  if (error) {
    console.error('Error fetching mutual funds:', error);
    return [];
  }
  return data || [];
}

function categorizeFunds(funds: any[]) {
  const categorized: Record<string, any[]> = {};
  fundCategories.forEach(cat => { categorized[cat.name] = []; });
  categorized['Others'] = [];

  for (const fund of funds) {
    const category = fund.category || '';
    let placed = false;
    for (const cat of fundCategories) {
      if (cat.keywords.some(kw => category.toLowerCase().includes(kw))) {
        categorized[cat.name].push(fund);
        placed = true;
        break;
      }
    }
    if (!placed) categorized['Others'].push(fund);
  }
  return categorized;
}

function formatCrore(val: number) {
  if (!val) return 'N/A';
  if (val >= 10000) return `${(val / 10000).toFixed(2)} Lac Cr`;
  return `${val.toFixed(2)} Cr`;
}

function FundCard({ fund }: { fund: any }) {
  const returnColor = (ret: number) => {
    if (!ret) return 'text-gray-500';
    return ret >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Link
      href={`/mutual-fund/${fund.slug}`}
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

export default async function MutualFundsIndexPage() {
  const funds = await getAllMutualFunds();
  const categorizedFunds = categorizeFunds(funds);

  // Featured: Top 6 by AUM
  const featuredFunds = funds.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-800 text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-1 text-sm mb-6">
            📊 500+ Mutual Funds
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            All Mutual Funds in India
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            Complete list of Indian mutual funds – NAV, returns, AUM, expense ratio, and riskometer. Updated daily.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <span>📊</span> 500+ Funds
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <span>⚡</span> Real NAV
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <span>🎯</span> Compare Returns
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-black text-orange-500">{funds.length}+</div><div className="text-xs text-gray-500">MUTUAL FUNDS</div></div>
          <div><div className="text-2xl font-black text-orange-500">12+</div><div className="text-xs text-gray-500">CATEGORIES</div></div>
          <div><div className="text-2xl font-black text-orange-500">₹50L+ Cr</div><div className="text-xs text-gray-500">TOTAL AUM</div></div>
          <div><div className="text-2xl font-black text-orange-500">Free</div><div className="text-xs text-gray-500">ACCESS</div></div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔍</div>
              <div>
                <h2 className="font-bold text-gray-800">Find a Mutual Fund</h2>
                <p className="text-xs text-gray-500">Search by name, fund house, or category</p>
              </div>
            </div>
            <div className="relative w-full md:w-96">
              <input
                type="text"
                id="fund-search"
                placeholder="e.g., SBI Blue Chip, HDFC Mid Cap..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-400 text-sm">⌘K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Funds */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>⭐</span> Top Funds by AUM
            </h2>
            <p className="text-sm text-gray-500 mt-1">Most popular funds in India</p>
          </div>
          <Link href="#all-funds" className="text-orange-500 text-sm font-medium hover:underline">
            View All Funds ↓
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredFunds.map((fund) => (
            <FundCard key={fund.slug} fund={fund} />
          ))}
        </div>
      </div>

      {/* Category-wise Sections */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12" id="all-funds">
        {fundCategories.map((category) => {
          const fundsList = categorizedFunds[category.name];
          if (!fundsList || fundsList.length === 0) return null;
          return (
            <section key={category.slug}>
              <div className="flex items-center gap-3 mb-5">
                <div className="text-3xl">{category.icon}</div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{category.name} Funds</h2>
                  <p className="text-sm text-gray-500">Best {category.name.toLowerCase()} mutual funds in India</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fundsList.slice(0, 8).map((fund) => (
                  <FundCard key={fund.slug} fund={fund} />
                ))}
              </div>
              {fundsList.length > 8 && (
                <div className="text-center mt-4">
                  <Link href={`/mutual-funds/category/${category.slug}`} className="text-orange-500 text-sm hover:underline">
                    + {fundsList.length - 8} more {category.name} funds →
                  </Link>
                </div>
              )}
            </section>
          );
        })}

        {/* Others category */}
        {categorizedFunds['Others'] && categorizedFunds['Others'].length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="text-3xl">📁</div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Other Funds</h2>
                <p className="text-sm text-gray-500">More mutual funds across various categories</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categorizedFunds['Others'].slice(0, 8).map((fund) => (
                <FundCard key={fund.slug} fund={fund} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Use ShareTargetPrice.in for Mutual Funds?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Accurate data, real NAV, and easy comparison – all free.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-bold text-gray-800">Real NAV & Returns</div>
              <div className="text-xs text-gray-500">Updated regularly from official sources</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-bold text-gray-800">Easy Comparison</div>
              <div className="text-xs text-gray-500">Compare funds side-by-side</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-bold text-gray-800">Mobile Friendly</div>
              <div className="text-xs text-gray-500">Works on all devices</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-bold text-gray-800">100% Free</div>
              <div className="text-xs text-gray-500">No signup, no cost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Client-side search script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('fund-search')?.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            const allCards = document.querySelectorAll('a[href^="/mutual-fund/"]');
            allCards.forEach(card => {
              const text = card.innerText.toLowerCase();
              const parent = card.closest('.group');
              if (parent) {
                if (term === '' || text.includes(term)) {
                  parent.style.display = '';
                } else {
                  parent.style.display = 'none';
                }
              }
            });
          });
        `
      }} />
    </div>
  );
}
