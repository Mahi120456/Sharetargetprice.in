'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Supabase connection

function StockDirectory() {
  const [activeLetter, setActiveLetter] = useState('A');
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Database se stocks fetch karna based on Letter
  useEffect(() => {
    async function fetchStocks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('stocks')
        .select('name, slug, sector')
        .ilike('name', `${activeLetter}%`) // Sirf us letter se shuru hone wale stocks
        .order('name', { ascending: true });

      if (!error) setStocks(data || []);
      setLoading(false);
    }
    fetchStocks();
  }, [activeLetter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen bg-slate-50/50">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
          A-Z <span className="text-orange-500">Stock</span> Directory
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
          Accessing <span className="font-bold text-slate-800">3,000+</span> share price forecasts.
        </p>
      </div>
      
      {/* Alphabet Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-16 sticky top-6 bg-white/70 backdrop-blur-xl py-6 z-30 border border-white/20 shadow-2xl rounded-[2rem] px-4">
        {alphabet.map(letter => (
          <button 
            key={letter} 
            onClick={() => setActiveLetter(letter)}
            className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-2xl font-bold transition-all duration-300 ${
              activeLetter === letter 
              ? 'bg-slate-900 text-orange-400 scale-125' 
              : 'bg-white text-slate-500 hover:bg-orange-50 border border-slate-100'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
           <div className="col-span-full text-center py-20 font-bold text-slate-400">Fetching "{activeLetter}" stocks...</div>
        ) : stocks.length > 0 ? (
          stocks.map((stock) => (
            <Link 
              key={stock.slug} 
              // Prompt ke hisaab se slug pattern set kiya
              href={`/stock/${stock.slug}-share-price-target`}
              className="group p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-orange-500 hover:shadow-xl transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {stock.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-800 group-hover:text-orange-600 truncate text-md uppercase">
                    {stock.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest">
                    {stock.sector || 'NSE/BSE'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">No data in database for "{activeLetter}"</h3>
            <p className="text-slate-400 mt-2">Database filling is in progress...</p>
          </div>
        )}
      </div>
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
