import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Flame } from 'lucide-react';

export const revalidate = 86400;

async function getTopPerformingFunds() {
  const { data, error } = await supabase
    .from('mutual_funds')
    .select('*')
    .not('returns_3y', 'is', null)
    .order('returns_3y', { ascending: false })
    .limit(20);

  if (error) return [];
  return data || [];
}

export const metadata: Metadata = {
  title: 'Top 20 Performing Mutual Funds 2026 – Highest 3Y Returns | ShareTargetPrice',
  description: 'Discover the top 20 mutual funds in India with highest 3-year returns. Compare NAV, AUM, expense ratio, risk rating. Find the best fund for your SIP or lumpsum investment.',
  keywords: 'top mutual funds, best performing funds, highest return mutual funds, top SIP funds, best equity funds',
};

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

export default async function TopPerformingPage() {
  const funds = await getTopPerformingFunds();
  if (!funds.length) return <div>No funds found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm mb-3">
            <Flame className="w-4 h-4" />
            Top 20 Ranked
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Top Performing Mutual Funds 2026
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Highest 3-year returns across all categories. Check NAV, AUM, expense ratio, and risk before investing.
          </p>
        </div>

        <div className="space-y-4">
          {funds.map((fund, idx) => (
            <Link
              key={fund.slug}
              href={`/mutual-funds/${fund.slug}`}
              className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                      {fund.scheme_name}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      <span>{fund.fund_house}</span>
                      <span>•</span>
                      <span>{fund.category}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full ${getRiskColor(fund.riskometer)}`}>{fund.riskometer}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-sm">
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
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <strong>📊 Ranking criteria:</strong> Sorted by 3-year CAGR returns (highest to lowest). Past performance is not a guarantee of future returns. Always diversify and consult your financial advisor.
        </div>

        <div className="mt-6 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Please read scheme documents carefully.
        </div>
      </div>
    </div>
  );
}
