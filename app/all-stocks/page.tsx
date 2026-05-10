'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function StockDirectory() {
  const [activeLetter, setActiveLetter] = useState('A');
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    async function fetchStocks() {
      setLoading(true);
      setDebugError(null);
      
      // Filter logic ko simple rakhte hain check karne ke liye
      const { data, error } = await supabase
        .from('stocks')
        .select('name, slug, sector')
        .ilike('name', `${activeLetter}%`)
        .order('name', { ascending: true });

      if (error) {
        setDebugError(error.message);
      } else {
        setStocks(data || []);
      }
      setLoading(false);
    }
    fetchStocks();
  }, [activeLetter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-slate-50/50">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
          A-Z <span className="text-orange-500">Stock</span> Directory
        </h1>
        <p className="text-slate-500">Accessing 3,000+ share price forecasts.</p>
      </div>
      
      {/* Scrollable Letters */}
      <div className="sticky top-4 z-40 mb-10 overflow-hidden">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-3xl p-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
            {alphabet.map(letter => (
              <button 
                key={letter} 
                onClick={() => setActiveLetter(letter)}
                className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl font-black transition-all ${
                  activeLetter === letter 
                  ? 'bg-slate-900 text-orange-400 scale-110 shadow-lg' 
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message if any */}
      {debugError && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-center border border-red-100">
          Database Error: {debugError}
        </div>
      )}

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-20 animate-pulse text-slate-400 font-bold">
            Searching for "{activeLetter}" Stocks...
          </div>
        ) : stocks.length > 0 ? (
          stocks.map((stock) => (
            <Link 
              key={stock.slug} 
              href={`/stock/${stock.slug}-share-price-target`}
              className="group p-5 bg-white border border-slate-200 rounded-3xl hover:border-orange-500 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center font-bold group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {stock.name[0]}
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-slate-800 group-hover:text-orange-600 truncate uppercase text-sm">
                    {stock.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">{stock.sector || 'NSE / BSE'}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-slate-200">
            <p className="text-slate-400 font-medium">No stocks found starting with "{activeLetter}"</p>
            <p className="text-[10px] mt-2 text-slate-300">Tip: Check if RLS is disabled in Supabase.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-20">Loading...</div>}>
      <StockDirectory />
    </Suspense>
  );
}
