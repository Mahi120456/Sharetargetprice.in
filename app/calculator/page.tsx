import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';   // 👈 ADD THIS LINE

export const metadata: Metadata = {
  title: 'Free Financial Calculators for Indian Investors | ShareTargetPrice.in',
  description: '50+ free financial calculators for SIP, EMI, CAGR, PPF, FD, RD, loans, retirement planning, and more – designed for Indian investors.',
  keywords: 'financial calculators, SIP calculator, EMI calculator, CAGR calculator, PPF calculator, FD calculator, RD calculator, loan calculator',
  openGraph: {
    title: 'Free Financial Calculators | ShareTargetPrice.in',
    description: 'Easy-to-use calculators for all your investment planning needs.',
    type: 'website',
  },
};

// ... rest of your code remains exactly the same (all imports, categories, functions, component, client‑side script)

// Calculator categories for organizing
const calculatorCategories = [
  { name: 'SIP & Mutual Funds', icon: '💰', slug: 'sip', keywords: ['sip', 'mutual', 'investment', 'wealth'] },
  { name: 'Loan & EMI', icon: '🏦', slug: 'loan', keywords: ['loan', 'emi', 'home', 'car', 'personal'] },
  { name: 'Investment Returns', icon: '📈', slug: 'returns', keywords: ['cagr', 'roi', 'lumpsum', 'compound'] },
  { name: 'Retirement & Savings', icon: '👴', slug: 'retirement', keywords: ['nps', 'ppf', 'retirement', 'savings'] },
  { name: 'Tax & FD', icon: '📊', slug: 'tax', keywords: ['fd', 'rd', 'tax', 'fixed deposit'] },
  { name: 'Stock Market', icon: '📉', slug: 'stock', keywords: ['stock', 'brokerage', 'intraday', 'margin'] },
];

async function getAllCalculators() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('posts')
    .select('slug, title, excerpt, category, featured_image')
    .eq('category', 'Calculator')
    .order('title', { ascending: true });
  return data || [];
}

// Helper function to categorize calculators
function categorizeCalculators(calculators: any[]) {
  const categorized: Record<string, any[]> = {};
  calculatorCategories.forEach(cat => { categorized[cat.name] = []; });
  categorized['Others'] = [];

  for (const calc of calculators) {
    const titleLower = calc.title.toLowerCase();
    let placed = false;
    for (const cat of calculatorCategories) {
      if (cat.keywords.some(kw => titleLower.includes(kw))) {
        categorized[cat.name].push(calc);
        placed = true;
        break;
      }
    }
    if (!placed) categorized['Others'].push(calc);
  }
  return categorized;
}

export default async function CalculatorsIndexPage() {
  const calculators = await getAllCalculators();
  const categorizedCalculators = categorizeCalculators(calculators);

  // Featured calculators (first 6 or popular ones)
  const featuredCalculators = calculators.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-800 text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-1 text-sm mb-6">
            🧮 50+ Free Tools
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            Financial Calculators
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            Free, easy-to-use calculators for SIP, EMI, loans, retirement planning, 
            and investment returns. Designed for Indian investors.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <span>📱</span> Mobile Friendly
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <span>⚡</span> Instant Results
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <span>🎯</span> 100% Free
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-orange-500">{calculators.length}+</div>
            <div className="text-xs text-gray-500">CALCULATORS</div>
          </div>
          <div>
            <div className="text-2xl font-black text-orange-500">10+</div>
            <div className="text-xs text-gray-500">CATEGORIES</div>
          </div>
          <div>
            <div className="text-2xl font-black text-orange-500">1M+</div>
            <div className="text-xs text-gray-500">MONTHLY USERS</div>
          </div>
          <div>
            <div className="text-2xl font-black text-orange-500">FREE</div>
            <div className="text-xs text-gray-500">ALWAYS</div>
          </div>
        </div>
      </div>

      {/* Search & Quick Access */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔍</div>
              <div>
                <h2 className="font-bold text-gray-800">Find a Calculator</h2>
                <p className="text-xs text-gray-500">Search by name or use categories below</p>
              </div>
            </div>
            <div className="relative w-full md:w-96">
              <input
                type="text"
                id="calc-search"
                placeholder="e.g., SIP, EMI, CAGR..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-400 text-sm">⌘K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs (for mobile/quick filter) – but we'll just show category sections directly */}

      {/* Featured Calculators */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>⭐</span> Featured Calculators
            </h2>
            <p className="text-sm text-gray-500 mt-1">Most popular tools</p>
          </div>
          <Link href="/all-calculators" className="text-orange-500 text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredCalculators.map((calc) => (
            <Link
              key={calc.slug}
              href={`/calculator/${calc.slug}`}
              className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition-all text-center"
            >
              <div className="text-3xl mb-2">🧮</div>
              <div className="font-semibold text-gray-800 group-hover:text-orange-600 text-sm line-clamp-2">
                {calc.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Category-wise Calculator Sections */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {calculatorCategories.map((category) => {
          const calcs = categorizedCalculators[category.name];
          if (!calcs || calcs.length === 0) return null;
          return (
            <section key={category.slug}>
              <div className="flex items-center gap-3 mb-5">
                <div className="text-3xl">{category.icon}</div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{category.name}</h2>
                  <p className="text-sm text-gray-500">Calculators for {category.name.toLowerCase()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {calcs.slice(0, 8).map((calc) => (
                  <Link
                    key={calc.slug}
                    href={`/calculator/${calc.slug}`}
                    className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🧮</span>
                      <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Free</span>
                    </div>
                    <div className="font-semibold text-gray-800 group-hover:text-orange-600 transition line-clamp-2 text-sm">
                      {calc.title}
                    </div>
                    {calc.excerpt && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{calc.excerpt}</p>
                    )}
                  </Link>
                ))}
              </div>
              {calcs.length > 8 && (
                <div className="text-center mt-4">
                  <Link href={`/category/calculator?type=${category.slug}`} className="text-orange-500 text-sm hover:underline">
                    + {calcs.length - 8} more in {category.name} →
                  </Link>
                </div>
              )}
            </section>
          );
        })}

        {/* Others category */}
        {categorizedCalculators['Others'] && categorizedCalculators['Others'].length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="text-3xl">📁</div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Other Calculators</h2>
                <p className="text-sm text-gray-500">More financial tools</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categorizedCalculators['Others'].slice(0, 8).map((calc) => (
                <Link
                  key={calc.slug}
                  href={`/calculator/${calc.slug}`}
                  className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🧮</span>
                    <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Free</span>
                  </div>
                  <div className="font-semibold text-gray-800 group-hover:text-orange-600 transition line-clamp-2 text-sm">
                    {calc.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA: Why Use Our Calculators */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Use Our Calculators?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Accurate, fast, and designed specifically for Indian financial products and regulations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-bold text-gray-800">Instant Results</div>
              <div className="text-xs text-gray-500">No page reload, calculate live</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🇮🇳</div>
              <div className="font-bold text-gray-800">Indian Markets</div>
              <div className="text-xs text-gray-500">Based on NSE/BSE, Indian tax rules</div>
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

      {/* Client-side search script (works with the input) */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('calc-search')?.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            const allLinks = document.querySelectorAll('a[href^="/calculator/"]');
            allLinks.forEach(link => {
              const text = link.innerText.toLowerCase();
              const card = link.closest('.group');
              if (card) {
                if (term === '' || text.includes(term)) {
                  card.style.display = '';
                } else {
                  card.style.display = 'none';
                }
              }
            });
          });
        `
      }} />
    </div>
  );
}
