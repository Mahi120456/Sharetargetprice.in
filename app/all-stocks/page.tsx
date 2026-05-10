'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function StockDirectory() {
  const [activeLetter, setActiveLetter] = useState('A');
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    async function fetchStocks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('stocks')
        .select('name, slug, sector')
        .ilike('name', `${activeLetter}%`)
        .order('name', { ascending: true });

      if (!error) setStocks(data || []);
      setLoading(false);
    }
    fetchStocks();
  }, [activeLetter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-slate-50/50">
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
          A-Z <span className="text-orange-500">Stock</span> Directory
        </h1>
        <p className="text-slate-500 text-sm md:text-lg">
          Accessing <span className="font-bold text-slate-800">3,000+</span> share price forecasts.
        </p>
      </div>
      
      {/* Sticky & Scrollable Navigation 
          Mobile mein ye ek line mein rahega aur scroll hoga (Left-to-Right)
      */}
      <div className="sticky top-4 z-40 mb-12">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-3 md:p-4 overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2">
            {alphabet.map(letter => (
              <button 
                key={letter} 
                onClick={() => setActiveLetter(letter)}
                className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl font-bold transition-all duration-300 ${
                  activeLetter === letter 
                  ? 'bg-slate-900 text-orange-400 scale-110 shadow-lg' 
                  : 'bg-slate-50 text-slate-500 hover:bg-orange-50 border border-slate-100'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
           <div className="col-span-full text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-bold text-slate-400">Fetching "{activeLetter}" stocks...</p>
           </div>
        ) : stocks.length > 0 ? (
          stocks.map((stock) => (
            <Link 
              key={stock.slug} 
              href={`/stock/${stock.slug}-share-price-target`}
              className="group p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-orange-500 hover:shadow-xl transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {stock.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-800 group-hover:text-orange-600 truncate text-sm uppercase">
                    {stock.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                    {stock.sector || 'NSE/BSE'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">No data in database for "{activeLetter}"</h3>
            <p className="text-slate-400 mt-2">Our AI is currently populating the "{activeLetter}" list.</p>
          </div>
        )}
      </div>

      {/* Hiding Scrollbar CSS */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-20">Loading Directory...</div>}>
      <StockDirectory />
    </Suspense>
  );
}
