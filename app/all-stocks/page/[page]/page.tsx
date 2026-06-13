import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const STOCKS_PER_PAGE = 20;

export async function generateStaticParams() {
  const { count } = await supabase
    .from('stocks_csv_data')
    .select('*', { count: 'exact', head: true });
  if (!count) return [];
  const totalPages = Math.ceil(count / STOCKS_PER_PAGE);
  return Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }));
}

export default async function PaginatedStocksPage({ params }: { params: { page: string } }) {
  const page = parseInt(params.page, 10);
  const offset = (page - 1) * STOCKS_PER_PAGE;

  const { data: stocks, error, count } = await supabase
    .from('stocks_csv_data')
    .select('name, symbol, sector, current_price, market_cap, pe_ratio, roe', { count: 'exact' })
    .order('name', { ascending: true })
    .range(offset, offset + STOCKS_PER_PAGE - 1);

  if (error || !stocks) notFound();

  const totalPages = Math.ceil((count || 0) / STOCKS_PER_PAGE);
  if (page < 1 || page > totalPages) notFound();

  const formatMarketCap = (val: number | null) => {
    if (!val) return '—';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L Cr`;
    if (val >= 100) return `₹${(val / 100).toFixed(1)}K Cr`;
    return `₹${val.toFixed(0)} Cr`;
  };
  const formatPrice = (val: number | null) => (val ? `₹${val.toLocaleString('en-IN')}` : '—');

  // ✅ Smart display name: fallback to symbol if name is garbage
  const getDisplayName = (stock: any) => {
    const name = stock.name?.trim();
    if (!name) return stock.symbol;
    // If name contains comma, '0P', or is too long -> likely garbage
    if (name.includes(',') || name.includes('0P') || name.length > 50 || name.includes('.')) {
      return stock.symbol;
    }
    return name;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-800 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-1 text-sm mb-6">📊 4700+ Indian Stocks</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Complete Stock Directory</h1>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto">Browse all NSE/BSE stocks – price, market cap, P/E, ROE and more. Updated daily.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm"><span>📊</span> {count}+ Stocks</div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm"><span>⚡</span> Real-time Data</div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm"><span>🎯</span> Price Targets</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-black text-orange-500">{count}+</div><div className="text-xs text-gray-500">STOCKS</div></div>
          <div><div className="text-2xl font-black text-orange-500">All Sectors</div><div className="text-xs text-gray-500">COVERED</div></div>
          <div><div className="text-2xl font-black text-orange-500">Free</div><div className="text-xs text-gray-500">ACCESS</div></div>
          <div><div className="text-2xl font-black text-orange-500">Daily</div><div className="text-xs text-gray-500">UPDATES</div></div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {stocks.map((stock) => {
            const displayName = getDisplayName(stock);
            return (
              <Link
                key={stock.symbol}
                href={`/stock/${stock.symbol.toLowerCase()}-share-price-target-2026-to-2050`}
                className="group bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="font-extrabold text-gray-800 group-hover:text-orange-600 line-clamp-1">
                    {displayName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{stock.symbol}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-400">Price</span><br/>{formatPrice(stock.current_price)}</div>
                    <div><span className="text-gray-400">Mkt Cap</span><br/>{formatMarketCap(stock.market_cap)}</div>
                    <div><span className="text-gray-400">P/E</span><br/>{stock.pe_ratio ?? '—'}</div>
                    <div><span className="text-gray-400">ROE</span><br/>{stock.roe ? `${stock.roe}%` : '—'}</div>
                  </div>
                  {stock.sector && (
                    <div className="mt-2">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{stock.sector}</span>
                    </div>
                  )}
                  <div className="mt-3 text-orange-500 text-xs font-medium group-hover:underline">View Analysis →</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <Link href={page === 2 ? '/all-stocks' : `/all-stocks/page/${page - 1}`} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 transition">
                ← Previous
              </Link>
            )}
            <span className="px-4 py-2 text-gray-700">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={`/all-stocks/page/${page + 1}`} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 transition">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 py-12 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Use ShareTargetPrice.in for Stocks?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">Real‑time data, analyst targets, and easy access – all free.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl mb-2">📈</div><div className="font-bold text-gray-800">Price Targets</div><div className="text-xs text-gray-500">2026 to 2050 forecasts</div></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl mb-2">🔍</div><div className="font-bold text-gray-800">Key Ratios</div><div className="text-xs text-gray-500">P/E, ROE, Debt/Equity</div></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl mb-2">📱</div><div className="font-bold text-gray-800">Mobile Friendly</div><div className="text-xs text-gray-500">Works on all devices</div></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl mb-2">🔒</div><div className="font-bold text-gray-800">100% Free</div><div className="text-xs text-gray-500">No signup, no cost</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
