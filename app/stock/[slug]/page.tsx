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
  // Agar slug "adani-power" hai, toh params me "adani-power-share-price-target" bhejega
  return stocks?.map((stock) => ({ 
    slug: `${stock.slug}-share-price-target` 
  })) || [];
}

export default async function Page({ params }: PageProps) {
  // Slug se asli database ID nikalne ke liye "-share-price-target" hatana hoga
  const cleanSlug = params.slug.replace('-share-price-target', '');

  const { data: stock } = await supabase
    .from('stocks')
    .select(`*, stock_keywords(*), stock_articles(*)`)
    .eq('slug', cleanSlug)
    .single();

  if (!stock) return notFound();

  const symbol = stock.symbol.includes(':') ? stock.symbol : `NSE:${stock.symbol}`;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Dynamic Hero Section */}
      <StockHero name={stock.name} symbol={stock.symbol} stats={stock} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-10">
          
          {/* 1. Live TradingView Chart */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border shadow-sm overflow-hidden">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{stock.name} Technical Analysis Chart</h2>
            <div className="h-[500px] w-full">
               <TradingViewChart symbol={stock.symbol} />
            </div>
          </div>

          {/* 2. AI Content Section */}
          <article className="prose prose-slate max-w-none bg-white p-8 md:p-12 rounded-3xl border shadow-sm shadow-orange-100/50">
            <h2 className="text-3xl font-black text-slate-900 border-l-8 border-orange-500 pl-4 mb-8">
              {stock.name} Detailed Analysis & Long-Term Outlook
            </h2>
            <div className="text-gray-700 space-y-6 text-lg leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: stock.content || `<p>Our AI is generating a 2500-word report for ${stock.name}...</p>` }} />
          </article>

          {/* 3. Financial Table (P&L Highlights) */}
          <section className="bg-white p-8 rounded-3xl border shadow-sm overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Fundamental Growth Metrics</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 border-b">Metric</th>
                  <th className="p-4 border-b">Value</th>
                  <th className="p-4 border-b">Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b font-medium text-slate-600">P/E Ratio</td>
                  <td className="p-4 border-b font-bold">{stock.pe_ratio || 'N/A'}</td>
                  <td className="p-4 border-b text-sm">{parseFloat(stock.pe_ratio) < 25 ? '✅ Attractive' : '⚠️ Expensive'}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b font-medium text-slate-600">ROE %</td>
                  <td className="p-4 border-b font-bold">{stock.roe || 'N/A'}%</td>
                  <td className="p-4 border-b text-sm">{parseFloat(stock.roe) > 15 ? '✅ Strong' : 'Neutral'}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 4. SEO Keywords & FAQ */}
          <section className="bg-white p-8 rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 underline decoration-orange-400">People Also Ask (FAQ)</h2>
            <div className="grid grid-cols-1 gap-4">
              {stock.stock_keywords?.slice(0, 8).map((kw: any, i: number) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all">
                  <h4 className="font-bold text-slate-800">What is the {kw.keyword}?</h4>
                  <p className="text-sm text-slate-600 mt-2">
                    According to our analysis, {stock.name} targets for {kw.keyword} are calculated based on EPS growth of {stock.eps || '15%'} and market sentiment.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl sticky top-24 border border-slate-800">
            <h3 className="font-bold text-2xl mb-6 text-orange-400">Price Prediction 🚀</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-white transition-colors">2026 Target</span> 
                <span className="font-bold text-green-400 text-xl font-mono">₹{stock.target_2026 || 'Loading'}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-white transition-colors">2030 Target</span> 
                <span className="font-bold text-green-400 text-xl font-mono">₹{stock.target_2030 || 'Loading'}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-white transition-colors">2050 Target</span> 
                <span className="font-bold text-green-400 text-xl font-mono">₹{stock.target_2050 || 'Loading'}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-10 leading-tight italic border-t border-slate-800 pt-4">
              *AI-generated estimates. Consult a SEBI registered advisor before investing.
            </p>
          </div>
          
          {/* News Component (Passing clean name) */}
          <NewsCarousel stock={stock.name} />
        </aside>
      </div>
    </main>
  );
}
