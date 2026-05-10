import { supabase } from "@/lib/supabase";
import StockHero from "@/components/StockHero";
import TradingViewChart from "@/components/TradingViewChart";
import NewsCarousel from "@/components/NewsCarousel";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

// 1. Dynamic SEO Title & Description
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stockName = params.slug.replace(/-/g, ' ').replace('share price target', '').trim();
  const titleName = stockName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    title: `${titleName} Share Price Target 2025, 2026, 2030 to 2050 - Deep Analysis`,
    description: `Detailed ${titleName} share price target analysis. Get technical predictions, fundamental research, and long term forecast for ${titleName}.`,
  };
}

// 2. Build time par 3000 pages generate karne ke liye
export async function generateStaticParams() {
  const { data: stocks } = await supabase.from('stocks').select('slug').limit(3000);
  return stocks?.map((stock) => ({ slug: stock.slug })) || [];
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;

  // Supabase se stock ka pura data aur keywords fetch karna
  const { data: stock } = await supabase
    .from('stocks')
    .select(`*, stock_keywords(*), stock_articles(*)`)
    .eq('slug', slug)
    .single();

  if (!stock) return notFound();

  // Data Cleanup for UI
  const stockName = stock.name;
  const symbol = stock.symbol.includes(':') ? stock.symbol : `NSE:${stock.symbol}`;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <StockHero name={stockName} symbol={stock.symbol} stats={stock} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-10">
          
          {/* CHART SECTION */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{stockName} Live Technical Chart</h2>
            <div className="h-[500px]">
               <TradingViewChart symbol={symbol} />
            </div>
          </div>

          {/* MAIN 2500+ WORDS ARTICLE (Content from Database) */}
          <article className="prose prose-slate max-w-none bg-white p-8 md:p-12 rounded-3xl border shadow-sm leading-relaxed">
            <h2 className="text-3xl font-black text-slate-900 border-l-8 border-orange-500 pl-4 mb-8">
              {stockName} Share Price Target & Comprehensive Investment Guide
            </h2>
            
            {/* Database se article content yahan aayega */}
            <div className="text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: stock.content }} />
            
            {!stock.content && (
              <p>Detailed analysis for {stockName} is being updated based on latest quarterly results...</p>
            )}
          </article>

          {/* KEYWORDS & FAQ SECTION (Naya Optimized Code) */}
          <section className="bg-white p-8 rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900">
              <span className="bg-orange-500 w-2 h-8 rounded-full"></span>
              {stockName} Share Price Target: Most Searched Queries
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stock.stock_keywords?.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200 group">
                  <span className="text-orange-400 font-bold group-hover:scale-110 transition-transform">#</span>
                  <p className="text-sm font-medium text-gray-700 leading-tight">
                    {item.keyword}
                  </p>
                </div>
              ))}
            </div>

            {/* Hidden Schema for Google (FAQ Markup) */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": stock.stock_keywords?.slice(0, 5).map((kw: any) => ({
                "@type": "Question",
                "name": `What is the ${kw.keyword}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${stockName} share price targets are based on technical indicators and fundamental growth. For ${kw.keyword}, our analysis suggests a strong outlook.`
                }
              }))
            })}} />
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl sticky top-24 border border-slate-800">
            <h3 className="font-bold text-2xl mb-6 text-orange-400">AI Price Prediction</h3>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">2026 Target</span> 
                <span className="font-bold text-green-400 font-mono">₹{stock.target_2026 || 'Calculated'}*</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">2030 Target</span> 
                <span className="font-bold text-green-400 font-mono">₹{stock.target_2030 || 'Calculated'}*</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-8 leading-tight italic">
              *Disclaimer: Predictions are AI-generated for educational use. Investing involves risk.
            </p>
          </div>
          <NewsCarousel stockName={stockName} />
        </aside>
      </div>
    </main>
  );
}
