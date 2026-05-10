import { supabase } from '@/lib/supabase';
import StockHero from '@/components/StockHero';
import TradingViewChart from '@/components/TradingViewChart';
import NewsCarousel from '@/components/NewsCarousel';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function Page({ params }: { params: { slug: string } }) {
  const { data: stock } = await supabase
    .from('stocks')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!stock) notFound();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <StockHero name={stock.name} symbol={stock.symbol} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-4">Technical Performance Chart</h2>
            <TradingViewChart symbol={stock.symbol} />
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm prose max-w-none">
            <h2 className="text-2xl font-bold">Price Target & Analysis</h2>
            <p className="text-gray-700 leading-relaxed">{stock.ai_analysis}</p>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Target Forecast</h3>
            <div className="space-y-3 border-t border-blue-800 pt-4">
              <p className="flex justify-between"><span>2025</span><span className="font-bold">₹{stock.target_2025}</span></p>
              <p className="flex justify-between"><span>2030</span><span className="font-bold">₹{stock.target_2030}</span></p>
              <p className="flex justify-between"><span>2040</span><span className="font-bold">₹{stock.target_2040}</span></p>
              <p className="flex justify-between"><span>2050</span><span className="font-bold">₹{stock.target_2050}</span></p>
            </div>
          </div>
          <NewsCarousel stockName={stock.name} />
        </aside>
      </div>
    </main>
  );
}
