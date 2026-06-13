'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Info } from 'lucide-react';
import StockHero from '@/components/StockHero';
import AuthorCard from '@/components/AuthorCard';
import { getAuthorBySlug } from '@/data/authors';

interface Props {
  stock: any;
  basePrice: number;
  targets: Record<number, string>;
  years: number[];
  symbol: string;
}

function StatCard({ label, value, sub }: { label: string; value: string | null; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
      {children}
    </h2>
  );
}

export default function StocksCsvClient({ stock, basePrice, targets, years, symbol }: Props) {
  const router = useRouter();
  const author = getAuthorBySlug('mahendra-maurya') || null;

  const fmt = (n: number | null) =>
    n != null ? `₹${n.toLocaleString('en-IN')}` : '—';

  const fmtNum = (n: number | null, suffix = '') =>
    n != null ? `${n}${suffix}` : '—';

  const allYears = [2025, 2026, 2027, 2028, 2030, 2035, 2040, 2045, 2050];

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero */}
      <StockHero name={stock.name} symbol={stock.symbol} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <StatCard label="Current Price" value={fmt(stock.current_price)} />
        <StatCard label="Market Cap" value={stock.market_cap ? `₹${(stock.market_cap / 100).toFixed(0)} Cr` : '—'} />
        <StatCard label="P/E Ratio" value={fmtNum(stock.pe_ratio)} />
        <StatCard label="EPS (TTM)" value={fmtNum(stock.eps)} />
        <StatCard label="ROE" value={fmtNum(stock.roe, '%')} />
        <StatCard label="ROCE" value={fmtNum(stock.roce, '%')} />
        <StatCard label="Debt / Equity" value={fmtNum(stock.debt_to_equity)} />
        <StatCard label="Book Value" value={fmtNum(stock.book_value)} />
      </div>

      {/* Sector & Industry */}
      {(stock.sector || stock.industry) && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {stock.sector && (
            <span className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full font-medium">
              {stock.sector}
            </span>
          )}
          {stock.industry && (
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full font-medium">
              {stock.industry}
            </span>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-6">
        <SectionTitle>{stock.name} Price Chart</SectionTitle>
        <iframe
          src={`https://s.tradingview.com/widgetembed/?symbol=NSE%3A${symbol}&interval=D&hidesidetoolbar=1&theme=light`}
          className="w-full h-[420px] rounded-xl"
          title={`${symbol} price chart`}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* Left — Targets + Fundamentals */}
        <div className="lg:col-span-2 space-y-6">

          {/* Price Targets Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SectionTitle>{stock.name} Share Price Target</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Year</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Target Price</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Upside</th>
                  </tr>
                </thead>
                <tbody>
                  {allYears.map((y) => {
                    const val = targets[y];
                    const num = val !== 'N/A' ? parseFloat(val.replace(/[₹,]/g, '')) : null;
                    const upside = num && basePrice ? (((num - basePrice) / basePrice) * 100).toFixed(1) : null;
                    return (
                      <tr key={y} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                        <td className="py-3 font-semibold text-gray-800">{y}</td>
                        <td className="py-3 text-right font-bold text-orange-500">
                          {val !== 'N/A' ? val : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-3 text-right">
                          {upside ? (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${parseFloat(upside) >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                              {parseFloat(upside) >= 0 ? '+' : ''}{upside}%
                            </span>
                          ) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <Info className="w-3 h-3" /> These are analyst estimates, not investment advice.
            </p>
          </div>

          {/* Fundamentals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SectionTitle>Key Fundamentals</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Net Profit Margin', value: fmtNum(stock.net_profit_margin, '%') },
                { label: 'Operating Margin', value: fmtNum(stock.operating_margin, '%') },
                { label: 'Return on Assets', value: fmtNum(stock.roa, '%') },
                { label: 'Promoter Holding', value: fmtNum(stock.promoter_holding, '%') },
                { label: 'Book Value', value: fmtNum(stock.book_value) },
                { label: 'EPS', value: fmtNum(stock.eps) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bull Bear Case */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-800">Bull Case</h3>
              </div>
              <p className="text-sm text-green-700">
                Strong fundamentals and sector tailwinds could push {stock.name} toward{' '}
                <strong>{targets[2030] !== 'N/A' ? targets[2030] : 'higher levels'}</strong> by 2030.
              </p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-red-800">Bear Case</h3>
              </div>
              <p className="text-sm text-red-700">
                Market volatility and macro headwinds could limit growth for {stock.name} in the near term.
              </p>
            </div>
          </div>

          <AuthorCard author={author} />
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-4">

          {/* Price Prediction Sticky Card */}
          <div className="bg-gray-900 text-white rounded-2xl p-5 sticky top-24">
            <h3 className="text-base font-bold mb-4">Price Prediction</h3>
            <div className="space-y-1">
              {years.map((y) => (
                <div key={y} className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-sm text-gray-400">{y}</span>
                  <span className="text-sm font-bold text-orange-400">{targets[y]}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">*Not investment advice</p>
          </div>

          {/* Shareholding */}
          {stock.promoter_holding && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Shareholding Pattern</h3>
              {[
                { label: 'Promoter', value: stock.promoter_holding, color: 'bg-blue-500' },
                { label: 'FII', value: stock.fii_holding, color: 'bg-green-500' },
                { label: 'DII', value: stock.dii_holding, color: 'bg-orange-500' },
                { label: 'Retail', value: stock.retail_holding, color: 'bg-purple-500' },
              ].map(({ label, value, color }) => value != null && (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{label}</span>
                    <span className="font-semibold text-gray-800">{value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

        </aside>
      </div>
    </main>
  );
}
