// 1. Sabse upar ye lines Next.js ka cache break karengi
export const dynamic = 'force-dynamic';
export const dynamicParams = true; 
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import StockHero from "@/components/StockHero";
import TradingViewChart from "@/components/TradingViewChart";
import NewsCarousel from "@/components/NewsCarousel";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

// 2. SEO Metadata (Isme bhi error handling add ki hai)
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
      title: `${titleName} Share Price Target 2025, 2030, 2040, 2050`,
      description: `Expert analysis and long term price targets for ${titleName}.`,
    };
  } catch (e) {
    return { title: "Stock Analysis" };
  }
}

// NOTE: generateStaticParams function ko bilkul mat dalna, wo 404 ka mukhya karan hai.

export default async function Page({ params }: PageProps) {
  // URL se suffix ko sahi se hatane ke liye split use kiya hai
  const cleanSlug = params.slug.split('-share-price-target')[0];

  // Database fetch
  const { data: stock, error } = await supabase
    .from('stocks')
    .select(`*, stock_keywords(*), stock_articles(*)`)
    .eq('slug', cleanSlug)
    .single();

  // Agar data nahi mila ya error aaya, toh 404
  if (error || !stock) {
    console.error("Supabase error for slug:", cleanSlug, error);
    return notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <StockHero name={stock.name} symbol={stock.symbol} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{stock.name} Technical Analysis</h2>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border">
               <TradingViewChart symbol={stock.symbol} />
            </div>
          </div>

          {/* Analysis Content */}
          <article className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
            <h2 className="text-3xl font-black text-slate-900 border-l-8 border-orange-500 pl-4 mb-8 uppercase tracking-tight">
              {stock.name} Forecast & Detailed Research
            </h2>
            <div 
              className="text-gray-700 space-y-6 text-lg leading-relaxed" 
              dangerouslySetInnerHTML={{ 
                __html: stock.content || `<p class="animate-pulse">Building detailed report for ${stock.name}... Check back in a moment.</p>` 
              }} 
            />
          </article>
        </div>

        {/* Sidebar Price Targets */}
        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-24 border border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <span className="p-2 bg-orange-500 rounded-lg animate-pulse"></span>
              <h3 className="font-bold text-2xl text-orange-400">Target Prices</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">2026 Target</span> 
                <span className="font-black text-green-400 text-2xl font-mono">₹{stock.target_2026 || '---'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">2030 Target</span> 
                <span className="font-black text-green-400 text-2xl font-mono">₹{stock.target_2030 || '---'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">2050 Target</span> 
                <span className="font-black text-green-400 text-2xl font-mono">₹{stock.target_2050 || '---'}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-10 leading-tight italic uppercase tracking-widest border-t border-slate-800 pt-4">
              *AI Prediction Model. Not Financial Advice.
            </p>
          </div>
          
          <NewsCarousel stock={stock.name} />
        </aside>
      </div>
    </main>
  );
}
