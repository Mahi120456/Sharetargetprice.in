export const dynamic = 'force-dynamic';
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

// 1. SEO Metadata Function
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // URL slug se database slug nikalna
  const cleanSlug = params.slug.replace('-share-price-target', '');
  
  const { data: stock } = await supabase
    .from('stocks')
    .select('name')
    .eq('slug', cleanSlug)
    .single();

  const titleName = stock?.name || cleanSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    title: `${titleName} Share Price Target 2025, 2026, 2030 to 2050`,
    description: `Expert ${titleName} share price target analysis. Get technical predictions and long term forecast.`,
    alternates: { canonical: `https://sharetargetprice.in/stock/${params.slug}` }
  };
}

// 2. Main Page Component
export default async function Page({ params }: PageProps) {
  // Step 1: Slug cleaning
  const cleanSlug = params.slug.replace('-share-price-target', '');

  // Step 2: Fetch data from Supabase
  const { data: stock, error } = await supabase
    .from('stocks')
    .select(`*, stock_keywords(*), stock_articles(*)`)
    .eq('slug', cleanSlug)
    .single();

  // Step 3: 404 Check
  if (!stock || error) {
    console.error("Stock fetch error or missing:", error);
    return notFound();
  }

  // Formatting for UI
  const peValue = stock.pe_ratio ? parseFloat(stock.pe_ratio) : 0;
  const roeValue = stock.roe ? parseFloat(stock.roe) : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <StockHero name={stock.name} symbol={stock.symbol} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Chart Section */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{stock.name} Technical Chart</h2>
            <div className="h-[500px] w-full rounded-xl overflow-hidden">
               <TradingViewChart symbol={stock.symbol} />
            </div>
          </div>

          {/* AI Content Analysis */}
          <article className="prose prose-slate max-w-none bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-3xl font-black text-slate-900 border-l-8 border-orange-500 pl-4 mb-8 uppercase tracking-tight">
              {stock.name} Detailed Analysis
            </h2>
            <div 
              className="text-gray-700 space-y-6 text-lg leading-relaxed" 
              dangerouslySetInnerHTML={{ 
                __html: stock.content || `<p class="animate-pulse">Generating 2500-word report for ${stock.name}... Our AI analysis will be live in a few minutes.</p>` 
              }} 
            />
          </article>

          {/* Fundamental Table */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Fundamental Metrics</h2>
            <div className="overflow-x-auto">
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
                    <td className="p-4 border-b font-medium">P/E Ratio</td>
                    <td className="p-4 border-b font-bold">{stock.pe_ratio || 'N/A'}</td>
                    <td className="p-4 border-b text-sm">
                      {peValue > 0 ? (peValue < 25 ? '✅ Attractive' : '⚠️ Monitor') : 'Data Pending'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b font-medium">ROE %</td>
                    <td className="p-4 border-b font-bold">{stock.roe || 'N/A'}%</td>
                    <td className="p-4 border-b text-sm">
                      {roeValue > 15 ? '✅ Strong' : 'Neutral'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* SIDEBAR Prediction Cards */}
        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-24 border border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2 bg-orange-500 rounded-lg animate-pulse"></span>
              <h3 className="font-bold text-2xl text-orange-400">Price Prediction</h3>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-2 border-b border-white/5 group">
                <span className="text-slate-400 group-hover:text-white transition-colors">2026 Target</span> 
                <span className="font-black text-green-400 text-2xl font-mono">₹{stock.target_2026 || '---'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 group">
                <span className="text-slate-400 group-hover:text-white transition-colors">2030 Target</span> 
                <span className="font-black text-green-400 text-2xl font-mono">₹{stock.target_2030 || '---'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 group">
                <span className="text-slate-400 group-hover:text-white transition-colors">2050 Target</span> 
                <span className="font-black text-green-400 text-2xl font-mono">₹{stock.target_2050 || '---'}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-10 leading-tight italic uppercase tracking-widest">
              *AI Prediction Model. Not Financial Advice.
            </p>
          </div>
          
          <NewsCarousel stock={stock.name} />
        </aside>
      </div>
    </main>
  );
}
