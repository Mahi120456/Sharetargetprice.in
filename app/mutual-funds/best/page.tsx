import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Crown, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Mutual Funds by Category – Top 10 Ranked | Share Target Price',
  description: 'Discover the top 10 best mutual funds across all categories – Large Cap, Mid Cap, Small Cap, ELSS, Hybrid, Multi Cap, Flexi Cap, and more. Compare returns, NAV, AUM, expense ratio, and risk.',
  keywords: 'best mutual funds, top mutual funds, best large cap funds, best mid cap funds, best small cap funds, best ELSS funds, best hybrid funds',
};

const categories = [
  { name: 'Large Cap', slug: 'large-cap', icon: '🏦', description: 'Top 10 large cap funds by 3Y returns' },
  { name: 'Mid Cap', slug: 'mid-cap', icon: '📊', description: 'Top 10 mid cap funds by 3Y returns' },
  { name: 'Small Cap', slug: 'small-cap', icon: '📈', description: 'Top 10 small cap funds by 3Y returns' },
  { name: 'ELSS', slug: 'elss', icon: '💰', description: 'Top 10 ELSS tax saving funds by 3Y returns' },
  { name: 'Hybrid', slug: 'hybrid', icon: '⚖️', description: 'Top 10 hybrid funds by 3Y returns' },
  { name: 'Multi Cap', slug: 'multi-cap', icon: '🔄', description: 'Top 10 multi cap funds by 3Y returns' },
  { name: 'Flexi Cap', slug: 'flexi-cap', icon: '🎯', description: 'Top 10 flexi cap funds by 3Y returns' },
  { name: 'Focused Fund', slug: 'focused-fund', icon: '🎯', description: 'Top 10 focused funds by 3Y returns' },
  { name: 'Value Fund', slug: 'value-fund', icon: '💎', description: 'Top 10 value funds by 3Y returns' },
  { name: 'Contra Fund', slug: 'contra-fund', icon: '🔄', description: 'Top 10 contra funds by 3Y returns' },
  { name: 'Dividend Yield', slug: 'dividend-yield', icon: '💵', description: 'Top 10 dividend yield funds by 3Y returns' },
];

export default function BestFundsListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        {/* Back link */}
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm mb-4">
            <Crown className="w-4 h-4" />
            Top 10 Ranked
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Best Mutual Funds by Category
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the top 10 best mutual funds across all categories. Based on 3‑year historical returns. Compare NAV, AUM, expense ratio, and risk before investing.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">📊 {categories.length} Categories</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">⭐ 10 Funds Each</span>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/mutual-funds/best/${cat.slug}`}
              className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{cat.icon}</div>
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-orange-500">
                    <span>View Top 10 →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <strong>📈 How we rank:</strong> Funds are sorted by 3‑year CAGR returns (highest to lowest). Past performance does not guarantee future returns. Always consult your advisor.
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Please read scheme documents carefully.
        </div>
      </div>
    </div>
  );
}
