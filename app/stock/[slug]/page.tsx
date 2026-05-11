// 1. Force Dynamic taaki Vercel database se har baar naya data maange aur 404 cache na kare
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

// 2. SEO Metadata Fix (Error Handling ke saath)
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
      title: `${titleName} Share Price Target 2025, 2030, 2050 - Full Analysis`,
      description: `Expert analysis and long term price targets for ${titleName} stock.`,
    };
  } catch (e) {
    return { title: "Stock Price Target Analysis" };
  }
}

export default async function Page({ params }: PageProps) {
  // URL se suffix ko hatane ka sabse safe tarika
  const cleanSlug = params.slug.split('-share-price-target')[0];

  // Database fetch - LOGS ke hisaab se 'stock_articles' ko hata diya hai kyunki wo relation error de raha tha
  const { data: stock, error } = await supabase
    .from('stocks')
    .select(`*, stock_keywords(*)`) 
    .eq('slug', cleanSlug)
    .single();

  // Agar error aaye ya data na mile toh 404 dikhao
  if (error || !stock) {
    console.error("Supabase error for slug:", cleanSlug, error?.message);
    return notFound();
  }

  // Price formatting
  const peValue = stock.pe_ratio ? parseFloat(stock.pe_ratio) : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen font-sans">
      <StockHero name={stock.name} symbol={stock.symbol} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-10">
          
          {/* 1. Live TradingView Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{stock.name} Technical Analysis Chart</h2>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border">
               <TradingViewChart symbol={stock.symbol} />
            </div>
          </div>

          {/* 2. Analysis Content Section */}
          <article className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
            <h2 className="text-3xl font-black text-slate-900 border-l-8 border-orange-500 pl-4 mb-8 uppercase tracking-tight">
              {stock.name} Detailed Analysis & Long-Term Outlook
            </h2>
            <div 
              className="text-gray-700 space-y-6 text-lg leading-relaxed" 
              dangerouslySetInnerHTML={{ 
                __html: stock.content || `<p class="animate-pulse text-orange-500">Generating 2500-word detailed report for ${stock.name}... Please check back in a few minutes.</p>` 
              }} 
            />
          </article>

          {/* 3. Fundamental Table */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Fundamental Growth Metrics</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 border-b font-bold text-slate-700">Metric</th>
                  <th className="p-4 border-b font-bold text-slate-700">Value</th>
                  <th className="p-4 border-b font-bold text-slate-700">Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b font-medium text-slate-600">P/E Ratio</td>
                  <td className="p-4 border-b font-bold text-slate-900">{stock.pe_ratio || 'N/A'}</td>
                  <td className="p-4 border-b text-sm">
                    {peValue > 0 ? (peValue < 25 ? '✅ Attractive' : '⚠️ Expensive') : 'Data Pending'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border-b font-medium text-slate-600">Market Cap</td>
                  <td className="p-4 border-b font-bold text-slate-900">{stock.market_cap || 'N/A'}</td>
                  <td className="p-4 border-b text-sm">Sector Giant</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* SIDEBAR - Target Cards */}
        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-24 border border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <span className="p-2 bg-orange-500 rounded-lg animate-pulse"></span>
              <h3 className="font-bold text-2xl text-orange-400">Price Prediction</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center group py-2 border-b border-white/5">
                <span className="text-slate-400 group-hover:text-white transition-colors">2026 Target</span> 
                <span className="font-black text-green-400 text-2xl font-mono">₹{stock.target_2026 || '---'}</span>
              </div>
              <div className="flex justify-between items-center group py-2 border-b border-white/5">
                <span className="text-slate-400 group-hover:text-white transition-colors">2030 Target</span> 
                <span className="font-black text-green-400 text-2xl font-mono">₹{stock.target_2030 || '---'}</span>
              </div>
              <div className="flex justify-between items-center group py-2 border-b border-white/5">
                <span className="text-slate-400 group-hover:text-white transition-colors">2050 Target</span> 
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
