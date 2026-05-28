import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Crown } from 'lucide-react';

export const revalidate = 86400;
export const dynamicParams = true;

// Categories for which we want "best funds" pages
const BEST_CATEGORIES = [
  { slug: 'large-cap', name: 'Large Cap' },
  { slug: 'mid-cap', name: 'Mid Cap' },
  { slug: 'small-cap', name: 'Small Cap' },
  { slug: 'elss', name: 'ELSS' },
  { slug: 'hybrid', name: 'Hybrid' },
  { slug: 'multi-cap', name: 'Multi Cap' },
  { slug: 'flexi-cap', name: 'Flexi Cap' },
  { slug: 'focused-fund', name: 'Focused Fund' },
  { slug: 'value-fund', name: 'Value Fund' },
  { slug: 'contra-fund', name: 'Contra Fund' },
  { slug: 'dividend-yield', name: 'Dividend Yield' },
];

export async function generateStaticParams() {
  return BEST_CATEGORIES.map(cat => ({ category: cat.slug }));
}

async function getBestFunds(categorySlug: string) {
  const categoryMap: Record<string, string> = {};
  BEST_CATEGORIES.forEach(c => { categoryMap[c.slug] = c.name; });
  const categoryName = categoryMap[categorySlug];
  if (!categoryName) return { funds: [], categoryName: null };

  const { data, error } = await supabase
    .from('mutual_funds')
    .select('*')
    .eq('category', categoryName)
    .not('returns_3y', 'is', null)
    .order('returns_3y', { ascending: false })
    .limit(10);

  if (error) return { funds: [], categoryName };
  return { funds: data || [], categoryName };
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const { categoryName, funds } = await getBestFunds(params.category);
  if (!categoryName || funds.length === 0) return { title: 'Not Found' };
  return {
    title: `Best ${categoryName} Mutual Funds 2026 – Top 10 Ranked by Returns | ShareTargetPrice`,
    description: `Discover the top 10 best ${categoryName} mutual funds in India based on 3-year returns. Compare performance, NAV, AUM, expense ratio, and risk. Find the best ${categoryName} fund for your SIP or lump sum investment.`,
    keywords: `best ${categoryName} funds, top ${categoryName} mutual funds, ${categoryName} fund ranking, best ${categoryName} SIP funds, high return ${categoryName} funds`,
  };
}

function formatAUM(aum: number) {
  if (!aum) return 'N/A';
  if (aum >= 10000) return `${(aum / 10000).toFixed(2)} Lac Cr`;
  return `${aum.toFixed(2)} Cr`;
}

function getRiskColor(risk: string) {
  switch (risk?.toLowerCase()) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'moderate': return 'bg-blue-100 text-blue-800';
    case 'moderately high': return 'bg-orange-100 text-orange-800';
    case 'high':
    case 'very high': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function BestCategoryPage({ params }: { params: { category: string } }) {
  const { funds, categoryName } = await getBestFunds(params.category);
  if (!categoryName || funds.length === 0) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm mb-3">
            <Crown className="w-4 h-4" />
            Top 10 Ranked
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Best {categoryName} Mutual Funds 2026
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Based on 3-year historical returns. Compare NAV, AUM, expense ratio, and risk before investing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {funds.map((fund, idx) => (
            <Link
              key={fund.slug}
              href={`/mutual-funds/${fund.slug}`}
              className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative"
            >
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {idx + 1}
              </div>
              <div className="ml-6">
                <h2 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors pr-16">
                  {fund.scheme_name}
                </h2>
                <p className="text-xs text-gray-500 mt-1">{fund.fund_house} • {fund.category}</p>
                
                <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">3Y Return</span>
                    <p className="font-bold text-green-600">{fund.returns_3y}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">NAV</span>
                    <p>₹{fund.nav?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">AUM</span>
                    <p>{formatAUM(fund.aum)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Expense</span>
                    <p>{fund.expense_ratio ?? 'N/A'}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Min SIP</span>
                    <p>₹{fund.min_sip_amount ?? 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Risk</span>
                    <p className={`inline-block px-2 py-0.5 rounded-full text-xs ${getRiskColor(fund.riskometer)}`}>{fund.riskometer}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <strong>📈 How we ranked:</strong> Funds are sorted by 3-year CAGR returns (highest to lowest). Past performance does not guarantee future returns. Please consult your advisor.
        </div>

        <div className="mt-6 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Please read scheme documents carefully.
        </div>
      </div>
    </div>
  );
}
