import StockHero from "@/components/StockHero";
import TradingViewChart from "@/components/TradingViewChart";
import NewsCarousel from "@/components/NewsCarousel";

export default function Page({ params }: { params: { slug: string } }) {
  // 1. URL se stock ka naam nikaalna (Example: 'tata-motors' from URL)
  const slug = params.slug.replace('-share-price-target', '');
  const cleanName = slug.replace(/-/g, ' ');
  const stockName = cleanName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const symbol = slug.split('-')[0].toUpperCase();

  // 2. 25 Automatic Low Competition Keywords
  const autoKeywords = [
    `${stockName} share price target 2025`,
    `${stockName} price prediction 2030`,
    `is ${stockName} good for long term?`,
    `${stockName} target price 2040`,
    `${stockName} share news today`,
    `${stockName} dividend history`,
    `nse ${symbol} analysis`,
    `${stockName} buy or sell`,
    `fundamental analysis of ${stockName}`,
    `${stockName} technical chart`,
    `${stockName} forecast tomorrow`,
    `${stockName} share price target 2050`,
    `${stockName} stock split update`,
    `expert view on ${stockName}`,
    `${stockName} q3 results`,
    `intrinsic value of ${stockName}`,
    `${stockName} multibagger potential`,
    `${stockName} share target price in hindi`,
    `is ${stockName} debt free?`,
    `${stockName} promoter holding`,
    `${stockName} share price history`,
    `${stockName} bonus share news`,
    `best price to buy ${stockName}`,
    `${stockName} future growth`,
    `sharetargetprice ${stockName} prediction`
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <StockHero name={stockName} symbol={symbol} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-2xl font-bold mb-4">{stockName} Analysis & Chart</h2>
            <TradingViewChart symbol={symbol} />
          </div>

          <section className="bg-white p-6 rounded-2xl border">
            <h2 className="text-xl font-bold mb-4">Important Search Terms for {stockName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {autoKeywords.map((kw, i) => (
                <div key={i} className="text-gray-600 p-2 bg-gray-50 rounded border text-sm">
                  🔍 {kw}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="font-bold text-xl mb-4">AI Prediction</h3>
            <div className="space-y-2">
              <p className="flex justify-between border-b border-blue-800 py-1 text-sm"><span>2025 Target</span> <span className="font-bold font-mono">₹1,420*</span></p>
              <p className="flex justify-between border-b border-blue-800 py-1 text-sm"><span>2030 Target</span> <span className="font-bold font-mono">₹3,150*</span></p>
            </div>
            <p className="text-[10px] text-blue-300 mt-4 leading-tight italic">*Estimated figures for education only.</p>
          </div>
          <NewsCarousel stockName={stockName} />
        </aside>
      </div>
    </div>
  );
}
