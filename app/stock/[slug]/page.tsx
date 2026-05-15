'use client';

import { supabase } from "@/lib/supabase";
import StockHero from "@/components/StockHero";
import LightweightChart from "@/components/LightweightChart";
import NewsCarousel from "@/components/NewsCarousel";
import QuickStatsCards from "@/components/QuickStatsCards";
import PerformanceChart from "@/components/PerformanceChart";
import BullBearCase from "@/components/BullBearCase";
import StockFAQ from "@/components/StockFAQ";
import PriceTargetsTable from "@/components/PriceTargetsTable";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: { slug: string };
}

function createFallbackStock(slug: string) {
  const cleanSlug = slug.split('-share-price-target')[0];
  const name = cleanSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const symbol = cleanSlug.split('-')[0].toUpperCase();
  return {
    id: 0,
    slug: cleanSlug,
    name: name,
    symbol: symbol,
    current_price: 1000,
    content: `<p>Detailed analysis for ${name} (${symbol}) is currently being generated. Please refresh after some time or check back later.</p><p>In the meantime, you can view the live chart and price targets below.</p>`,
    stock_keywords: [],
    target_2026: null,
    target_2027: null,
    target_2028: null,
    target_2030: null,
    target_2035: null,
    target_2040: null,
    target_2050: null,
  };
}

export default function Page({ params }: PageProps) {
  const router = useRouter();
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const originalSlug = params.slug;
  const cleanSlug = originalSlug.split('-share-price-target')[0];

  useEffect(() => {
    let isMounted = true;

    async function fetchStock() {
      try {
        let { data, error } = await supabase
          .from('stocks')
          .select(`*, stock_keywords(*)`)
          .eq('slug', originalSlug)
          .single();

        if (error || !data) {
          console.log(`No data for slug "${originalSlug}", trying "${cleanSlug}"`);
          const result = await supabase
            .from('stocks')
            .select(`*, stock_keywords(*)`)
            .eq('slug', cleanSlug)
            .single();
          data = result.data;
          error = result.error;
        }

        if (isMounted) {
          if (error || !data) {
            console.error("Supabase error for both slugs:", error?.message);
            setErrorMsg(`Stock not found: ${originalSlug}. Please check back later.`);
            setStock(createFallbackStock(originalSlug));
          } else {
            setStock(data);
            setErrorMsg(null);
          }
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Unexpected error:", err);
        if (isMounted) {
          setErrorMsg(err.message || "Failed to load stock data");
          setStock(createFallbackStock(originalSlug));
          setLoading(false);
        }
      }
    }

    fetchStock();

    return () => {
      isMounted = false;
    };
  }, [originalSlug, cleanSlug]);

  if (loading) return <div className="text-center p-10">Loading stock data...</div>;
  if (!stock) return notFound();

  const basePrice = stock.current_price || 100;
  const getTarget = (year: number, multiplier: number) => {
    if (stock[`target_${year}`]) return stock[`target_${year}`];
    return `₹${Math.round(basePrice * multiplier).toLocaleString('en-IN')}`;
  };

  // 🔥 2025 removed from targets and years
  const targets = {
    2026: getTarget(2026, 1.35),
    2027: getTarget(2027, 1.60),
    2028: getTarget(2028, 1.90),
    2030: getTarget(2030, 2.50),
    2035: getTarget(2035, 4.50),
    2040: getTarget(2040, 8.00),
    2050: getTarget(2050, 20.00),
  };
  const years = [2026, 2027, 2028, 2030, 2035, 2040, 2050];

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

          {/* Price Targets Table (2025 removed) */}
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
                  __html: stock.content || `<p class="text-gray-500 italic">Generating detailed analysis for ${stock.name}... Please check back soon for comprehensive research report including financial health, growth drivers, and risk factors.</p>` 
                }} 
              />
            </div>
          </article>

          <StockFAQ stockName={stock.name} />
        </div>

        {/* Sidebar Price Prediction */}
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
