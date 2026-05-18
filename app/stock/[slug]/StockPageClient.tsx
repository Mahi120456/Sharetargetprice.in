'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import StockHero from "@/components/StockHero";
import LightweightChart from "@/components/LightweightChart";
import NewsCarousel from "@/components/NewsCarousel";
import QuickStatsCards from "@/components/QuickStatsCards";
import PerformanceChart from "@/components/PerformanceChart";
import BullBearCase from "@/components/BullBearCase";
import StockFAQ from "@/components/StockFAQ";
import PriceTargetsTable from "@/components/PriceTargetsTable";

// Performance Section (Groww Style)
function PerformanceSection({ stock }: { stock: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Performance</h2>
        {stock.last_updated && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Last updated: {new Date(stock.last_updated).toLocaleDateString('en-IN')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Today's Range */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Today's Range</p>
          <div className="flex justify-between text-sm font-medium">
            <span>₹{stock.low52 || '—'}</span>
            <span>₹{stock.high52 || '—'}</span>
          </div>
        </div>

        {/* 52 Week Range */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">52 Week Range</p>
          <div className="flex justify-between text-sm font-medium">
            <span>₹{stock.low52 || '—'}</span>
            <span>₹{stock.high52 || '—'}</span>
          </div>
        </div>

        {/* Open / Prev Close */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-xs text-gray-500">Open</p>
              <p className="font-medium">₹{stock.open_price || stock.current_price}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Prev Close</p>
              <p className="font-medium">₹{stock.prev_close || stock.current_price}</p>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Volume</p>
          <p className="font-semibold text-lg">{(stock.volume || 0).toLocaleString('en-IN')}</p>
        </div>

        {/* Circuit Limits */}
        <div className="bg-gray-50 rounded-xl p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Circuit Limits</p>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-red-600">Lower: ₹{stock.lower_circuit || '—'}</span>
            <span className="text-green-600">Upper: ₹{stock.upper_circuit || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StockPageClientProps {
  stock: any;
  basePrice: number;
  targets: Record<number, string>;
  years: number[];
  errorMsg?: string | null;
}

export default function StockPageClient({ 
  stock, 
  basePrice, 
  targets, 
  years, 
  errorMsg 
}: StockPageClientProps) {
  const router = useRouter();

  return (
    <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen font-sans">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition-colors bg-white border border-gray-200 hover:border-orange-200 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      <StockHero name={stock.name} symbol={stock.symbol} />
      <QuickStatsCards stock={stock} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* ✅ NEW: Performance Section (Groww Style) */}
          <PerformanceSection stock={stock} />

          {/* Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-bold text-gray-900">{stock.name} Live Chart</h2>
              <p className="text-sm text-gray-500 mt-1">Interactive chart with Technical Indicators</p>
            </div>
            <div className="p-4">
              <div className="h-[450px] w-full rounded-xl overflow-hidden">
                <LightweightChart symbol={stock.symbol} height={450} />
              </div>
            </div>
          </div>

          <PerformanceChart symbol={stock.symbol} stockName={stock.name} />

          <PriceTargetsTable 
            stockName={stock.name}
            symbol={stock.symbol}
            currentPrice={basePrice}
            targets={targets}
          />

          <BullBearCase 
            stockName={stock.name} 
            currentPrice={stock.current_price || 100} 
            target2026={targets[2026]}
          />

          {/* Analysis Article */}
          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-3xl">📊</span> 
                {stock.name} Detailed Analysis
              </h2>
            </div>
            <div className="p-4 md:p-6">
              <div 
                className="post-content max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: stock.content || `<p class="text-gray-500 italic">Generating detailed analysis...</p>` 
                }} 
              />
            </div>
          </article>

          <StockFAQ stockName={stock.name} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl sticky top-24 overflow-hidden">
            <div className="p-6 border-b border-gray-700 bg-orange-600/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center animate-pulse">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl">Price Prediction</h3>
                  <p className="text-xs text-gray-400">Long-term forecast</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {years.map((year) => (
                <div key={year} className="flex justify-between items-center group py-2 border-b border-gray-700/50 hover:border-orange-500/30 transition-all">
                  <span className="text-gray-300 text-sm font-medium">{year}</span>
                  <span className="font-bold text-orange-400 text-xl font-mono tracking-tight">
                    {targets[year as keyof typeof targets] || `₹${Math.round(basePrice * (year === 2050 ? 20 : year === 2040 ? 8 : 1)).toLocaleString('en-IN')}`}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-800/50">
              <p className="text-[10px] text-gray-500 text-center uppercase tracking-wider">*AI Prediction • Not Advice</p>
            </div>
          </div>
          <NewsCarousel stock={stock.name} />
        </aside>
      </div>
    </main>
  );
}
