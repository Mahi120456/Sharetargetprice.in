import { supabase } from "@/lib/supabase";
import StockHero from "@/components/StockHero";
import TradingViewChart from "@/components/TradingViewChart";
import NewsCarousel from "@/components/NewsCarousel";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

// 1. SEO Metadata (Google Discover Friendly)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stockName = params.slug.replace(/-/g, ' ').replace('share price target', '').trim();
  const titleName = stockName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    title: `${titleName} Share Price Target 2025, 2026, 2030 to 2050 - Deep Analysis`,
    description: `Expert ${titleName} share price target analysis. Get technical predictions, fundamental research, P&L reports, and long term forecast for ${titleName} stock.`,
    alternates: { canonical: `https://sharetargetprice.in/stock/${params.slug}` }
  };
}

// 2. 3000 Pages Generation Logic
export async function generateStaticParams() {
  const { data: stocks } = await supabase.from('stocks').select('slug');
  return stocks?.map((stock) => ({ 
    slug: `${stock.slug}-share-price-target` 
  })) || [];
}

export default async function Page({ params }: PageProps) {
  const cleanSlug = params.slug.replace('-share-price-target', '');

  const { data: stock } = await supabase
    .from('stocks')
    .select(`*, stock_keywords(*), stock_articles(*)`)
    .eq('slug', cleanSlug)
    .single();

  if (!stock) return notFound();

  // Price target values ko safe number mein convert karna
  const peValue = stock.pe_ratio ? parseFloat(stock.pe_ratio) : 0;
  const roeValue = stock.roe ? parseFloat(stock.roe) : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen font-sans">
      {/* Dynamic Hero Section - Stats removed to fix Type Error */}
      <StockHero name={stock.name} symbol={stock.symbol} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-10">
          
          {/* 1. Live TradingView Chart */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{stock.name} Technical Analysis Chart</h2>
            <div className="h-[500px] w-full rounded-xl overflow-hidden">
               <TradingViewChart symbol={stock.symbol} />
            </div>
          </div>

          {/* 2. AI Content Section */}
          <article className="prose prose-slate max-w-none bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-3xl font-black text-slate-900 border-l-8 border-orange-500 pl-4 mb-8 uppercase tracking-tight">
              {stock.name} Detailed Analysis & Long-Term Outlook
            </h2>
            <div className="text-gray-700 space-y-6 text-lg leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: stock.content || `<p className="animate-pulse">Our AI is generating a detailed 2500-word report for ${stock.name}... Please check back in a few minutes.</p>` }} />
          </article>

          {/* 3. Financial Table (P&L Highlights) */}
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
                  <td className="p-4 border-b font-medium text-slate-600">ROE %</td>
                  <td className="p-4 border-b font-bold text-slate-900">{stock.roe || 'N/A'}%</td>
                  <td className="p-4 border-b text-sm">
                    {roeValue > 0 ? (roeValue > 15 ? '✅ Strong' : 'Neutral') : 'Data Pending'}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 4. SEO Keywords & FAQ */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 underline decoration-orange-400 underline-offset-8">People Also Ask (FAQ)</h2>
            <div className="grid grid-cols-1 gap-4">
              {stock.stock_keywords && stock.stock_keywords.length > 0 ? (
                stock.stock_keywords.slice(0, 8).map((kw: any, i: number) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300">
                    <h4 className="font-bold text-slate-800">What is the {kw.keyword}?</h4>
                    <p className="text-sm text-slate-600 mt-2">
                      Based on our AI-driven technical analysis, the target for {kw.keyword} for {stock.name} is calculated using current EPS growth and historical P/E multiples.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">FAQ section is being updated with latest targets...</p>
              )}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-24 border border-slate-800">
            <div className="flex items-center gap-3 mb-6">
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
            <p className="text-[10px] text-slate-500 mt-10 leading-tight italic border-t border-slate-800 pt-4 uppercase tracking-widest">
              *AI Prediction Model v2.1. Not Financial Advice.
            </p>
          </div>
          
          <NewsCarousel stock={stock.name} />
        </aside>
      </div>
    </main>
  );
}
