'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import StockHero from '@/components/StockHero';
import QuickStatsCards from '@/components/QuickStatsCards';
import PriceTargetsTable from '@/components/PriceTargetsTable';
import BullBearCase from '@/components/BullBearCase';
import AuthorCard from '@/components/AuthorCard';
import { getAuthorBySlug } from '@/data/authors';

export default function StocksCsvClient({ stock, basePrice, targets, years, symbol }: any) {
  const router = useRouter();
  const author = getAuthorBySlug('mahendra-maurya');

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 hover:text-orange-500 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <StockHero name={stock.name} symbol={stock.symbol} />
      <QuickStatsCards stock={stock} />

      {/* TradingView Chart */}
      <div className="bg-white rounded-2xl shadow-md p-4 mt-6">
        <iframe
          src={`https://s.tradingview.com/widgetembed/?symbol=NSE%3A${symbol}&interval=D&hidesidetoolbar=1`}
          className="w-full h-[450px] rounded-xl"
          title={`${symbol} chart`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <PriceTargetsTable stockName={stock.name} symbol={stock.symbol} currentPrice={basePrice} targets={targets} />
          <BullBearCase stockName={stock.name} currentPrice={basePrice} target2026={targets[2026]} />
          <AuthorCard author={author} />
        </div>
        <aside className="space-y-4">
          <div className="bg-gray-900 text-white rounded-2xl p-6 sticky top-24">
            <h3 className="text-xl font-bold">Price Prediction</h3>
            {years.map((y) => (
              <div key={y} className="flex justify-between py-2 border-b border-gray-700">
                <span>{y}</span>
                <span className="text-orange-400 font-bold">{targets[y]}</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-4">*Not investment advice</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
