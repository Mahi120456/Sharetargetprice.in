'use client'; // 👈 Temporary: Convert to client component to bypass event handler issues

import { supabase } from "@/lib/supabase";
import StockHero from "@/components/StockHero";
import TradingViewChart from "@/components/TradingViewChart";
import NewsCarousel from "@/components/NewsCarousel";
import QuickStatsCards from "@/components/QuickStatsCards";
import PerformanceChart from "@/components/PerformanceChart";
import BullBearCase from "@/components/BullBearCase";
import StockFAQ from "@/components/StockFAQ";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface PageProps {
  params: { slug: string };
}

export default function Page({ params }: PageProps) {
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const cleanSlug = params.slug.split('-share-price-target')[0];

  useEffect(() => {
    async function fetchStock() {
      const { data, error } = await supabase
        .from('stocks')
        .select(`*, stock_keywords(*)`)
        .eq('slug', cleanSlug)
        .single();

      if (error || !data) {
        console.error("Supabase error:", cleanSlug, error?.message);
        notFound();
      } else {
        setStock(data);
      }
      setLoading(false);
    }
    fetchStock();
  }, [cleanSlug]);

  if (loading) return <div className="text-center p-10">Loading stock data...</div>;
  if (!stock) return notFound();

  const basePrice = stock.current_price || 100;
  const getTarget = (year: number, multiplier: number) => {
    if (stock[`target_${year}`]) return stock[`target_${year}`];
    return `₹${Math.round(basePrice * multiplier).toLocaleString('en-IN')}`;
  };

  const targets = {
    2025: getTarget(2025, 1.15),
    2026: getTarget(2026, 1.35),
    2027: getTarget(2027, 1.60),
    2028: getTarget(2028, 1.90),
    2030: getTarget(2030, 2.50),
    2035: getTarget(2035, 4.50),
    2040: getTarget(2040, 8.00),
    2050: getTarget(2050, 20.00),
  };
  const years = [2025, 2026, 2027, 2028, 2030, 2035, 2040, 2050];

  return (
    // 🔽 Reduced horizontal padding: px-2 on mobile, sm:px-4, md:px-6
    <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen font-sans">
      <StockHero name={stock.name} symbol={stock.symbol} />
      <QuickStatsCards stock={stock} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-bold text-gray-900">{stock.name} Live Chart</h2>
              <p className="text-sm text-gray-500 mt-1">Interactive chart with Technical Indicators</p>
            </div>
            <div className="p-4">
              <div className="h-[450px] w-full rounded-xl overflow-hidden">
                <TradingViewChart symbol={stock.symbol} />
              </div>
            </div>
          </div>

          <PerformanceChart symbol={stock.symbol} stockName={stock.name} />

          {/* ⚠️ PriceTargetsTable temporarily removed – causing build timeout */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center text-gray-500">
            <p>Price targets table will be restored after build fix.</p>
          </div>

          <BullBearCase 
            stockName={stock.name} 
            currentPrice={stock.current_price || 100} 
            target2026={targets[2026]}
          />

          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-3xl">📊</span> 
                {stock.name} Detailed Analysis
              </h2>
            </div>
            {/* 🔽 Reduced padding inside article content */}
            <div className="p-4 md:p-6">
              <div 
                className="post-content max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: stock.content || `<p class="text-gray-500 italic">Generating detailed analysis for ${stock.name}... Please check back soon for comprehensive research report including financial health, growth drivers, and risk factors.</p>` 
                }} 
              />
            </div>
          </article>

          {/* FAQ Section */}
          <StockFAQ stockName={stock.name} />
        </div>

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
