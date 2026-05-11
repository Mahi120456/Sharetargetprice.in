// Force dynamic for live data
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import StockHero from "@/components/StockHero";
import TradingViewChart from "@/components/TradingViewChart";
import NewsCarousel from "@/components/NewsCarousel";
import QuickStatsCards from "@/components/QuickStatsCards";
import PerformanceChart from "@/components/PerformanceChart";
import PriceTargetsTable from "@/components/PriceTargetsTable";
import BullBearCase from "@/components/BullBearCase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

// SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cleanSlug = params.slug.split('-share-price-target')[0];
  try {
    const { data: stock } = await supabase
      .from('stocks')
      .select('name')
      .eq('slug', cleanSlug)
      .single();
    const titleName = stock?.name || cleanSlug.replace(/-/g, ' ').toUpperCase();
    return {
      title: `${titleName} Share Price Target 2025, 2030, 2050 - Expert Analysis`,
      description: `Get detailed ${titleName} share price target for 2025, 2026, 2027, 2030, 2040 & 2050. Expert analysis with charts, fundamentals, and long-term outlook.`,
      keywords: `${titleName} share price target, ${titleName} stock prediction, ${titleName} 2030 target, ${titleName} 2050 forecast`,
      openGraph: {
        title: `${titleName} Share Price Target 2025-2050`,
        description: `Expert price targets and analysis for ${titleName} stock.`,
        type: 'website',
      },
    };
  } catch {
    return { title: "Stock Price Target Analysis" };
  }
}

// Years array for targets
const years = [2025, 2026, 2027, 2028, 2030, 2035, 2040, 2050];

export default async function Page({ params }: PageProps) {
  const cleanSlug = params.slug.split('-share-price-target')[0];

  const { data: stock, error } = await supabase
    .from('stocks')
    .select(`*, stock_keywords(*)`)
    .eq('slug', cleanSlug)
    .single();

  if (error || !stock) {
    console.error("Supabase error:", cleanSlug, error?.message);
    return notFound();
  }

  // Generate dynamic targets if not present
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen font-sans">
      
      {/* Hero Section with Live Price */}
      <StockHero name={stock.name} symbol={stock.symbol} />
      
      {/* Quick Stats Cards */}
      <QuickStatsCards stock={stock} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
        
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TradingView Chart */}
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

          {/* Performance vs Benchmark */}
          <PerformanceChart symbol={stock.symbol} stockName={stock.name} />

          {/* Price Targets Table */}
          <PriceTargetsTable 
            stockName={stock.name} 
            symbol={stock.symbol} 
            targets={targets} 
            currentPrice={stock.current_price || 100}
          />

          {/* Bull / Base / Bear Case */}
          <BullBearCase 
            stockName={stock.name} 
            currentPrice={stock.current_price || 100} 
            target2026={targets[2026]}
          />

          {/* Detailed Analysis Content */}
          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-3xl">📊</span> 
                {stock.name} Detailed Analysis
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div 
                className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-a:text-orange-600 prose-strong:text-gray-900 prose-li:text-gray-600"
                dangerouslySetInnerHTML={{ 
                  __html: stock.content || `<p class="text-gray-500 italic">Generating detailed analysis for ${stock.name}... Please check back soon for comprehensive research report including financial health, growth drivers, and risk factors.</p>` 
                }} 
              />
            </div>
          </article>
        </div>

        {/* Right Column - Sidebar (1/3 width on desktop) */}
        <aside className="space-y-6">
          
          {/* Sticky Price Prediction Card */}
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
              <p className="text-[10px] text-gray-500 text-center leading-relaxed uppercase tracking-wider">
                *AI Prediction Model • Not Financial Advice
              </p>
            </div>
          </div>
          
          {/* News Section */}
          <NewsCarousel stock={stock.name} />
        </aside>
      </div>
    </main>
  );
}
