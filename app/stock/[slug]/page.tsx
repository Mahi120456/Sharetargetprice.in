import StockHero from "@/components/StockHero";
import TradingViewChart from "@/components/TradingViewChart";
import NewsCarousel from "@/components/NewsCarousel";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

// Ye function har stock ka SEO title auto-generate karega
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stockName = params.slug.replace(/-/g, ' ').replace('share price target', '').trim();
  const titleName = stockName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    title: `${titleName} Share Price Target 2025, 2026, 2030, 2040, 2050`,
    description: `Get the latest ${titleName} share price target analysis. Live chart, technical prediction and long term forecast for ${titleName} stock.`,
  };
}

export default function Page({ params }: PageProps) {
  const currentSlug = params?.slug || ""; 
  
  if (!currentSlug) return <div className="p-20 text-center">Loading Stock Data...</div>;

  // URL cleanup logic
  const cleanSlug = currentSlug.replace('-share-price-target', '');
  const cleanName = cleanSlug.replace(/-/g, ' ');
  const stockName = cleanName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const symbol = cleanSlug.split('-')[0].toUpperCase();

  const autoKeywords = [
    `${stockName} share price target 2025`,
    `${stockName} price prediction 2030`,
    `is ${stockName} good for long term?`,
    `${stockName} target price 2040`,
    `${stockName} share news today`,
    `${stockName} dividend history`,
    `nse ${symbol} analysis`,
    `${stockName} buy or sell`,
    `${stockName} technical chart`,
    `${stockName} share price target 2050`,
    `sharetargetprice ${stockName} prediction`
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <StockHero name={stockName} symbol={symbol} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{stockName} Analysis & Live Chart</h2>
            <div className="h-[400 md:h-[500px]">
               <TradingViewChart symbol={symbol} />
            </div>
          </div>

          <section className="bg-white p-6 rounded-2xl border">
            <h2 className="text-xl font-bold mb-4">Stock Market Analysis Terms: {stockName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {autoKeywords.map((kw, i) => (
                <div key={i} className="text-gray-600 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm hover:bg-orange-50 transition-colors">
                  🔍 {kw}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl text-center border border-slate-800">
            <h3 className="font-bold text-2xl mb-6 text-orange-400">AI Prediction</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-slate-400">2025 Target</span> 
                <span className="font-bold text-xl text-green-400 font-mono">₹1,420*</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-slate-400">2030 Target</span> 
                <span className="font-bold text-xl text-green-400 font-mono">₹3,150*</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-6 leading-tight italic">
              *Disclaimer: AI predictions are for educational purposes only. Investing in stocks involves risk.
            </p>
          </div>
          <NewsCarousel stockName={stockName} />
        </aside>
      </div>
    </div>
  );
}
