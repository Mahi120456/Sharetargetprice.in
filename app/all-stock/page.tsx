'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function AllStocks() {
  const [activeLetter, setActiveLetter] = useState('A');
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Aapki CSV se nikaali gayi main stocks list
  const allStocks = useMemo(() => [
    { name: "Adani Power", slug: "adani-power-share-price-target" },
    { name: "Adani Green", slug: "adani-green-share-price-target" },
    { name: "Alok Industries", slug: "alok-industries-share-price-target" },
    { name: "Ambuja Cement", slug: "ambuja-cement-share-price-target" },
    { name: "BSE Ltd", slug: "bse-share-price-target" },
    { name: "Bajaj Auto", slug: "bajaj-auto-share-price-target" },
    { name: "Coal India", slug: "coal-india-share-price-target" },
    { name: "HDFC Bank", slug: "hdfc-bank-share-price-target" },
    { name: "HAL", slug: "hal-share-price-target" },
    { name: "HUDCO", slug: "hudco-share-price-target" },
    { name: "IEX", slug: "iex-share-price-target" },
    { name: "IRFC", slug: "irfc-share-price-target" },
    { name: "IREDA", slug: "ireda-share-price-target" },
    { name: "IRCTC", slug: "irctc-share-price-target" },
    { name: "ITC", slug: "itc-share-price-target" },
    { name: "Jio Financial", slug: "jio-financial-share-price-target" },
    { name: "L&T", slug: "l-and-t-share-price-target" },
    { name: "Mankind Pharma", slug: "mankind-pharma-share-price-target" },
    { name: "NHPC", slug: "nhpc-share-price-target" },
    { name: "NBCC", slug: "nbcc-share-price-target" },
    { name: "Nykaa", slug: "nykaa-share-price-target" },
    { name: "Ola Electric", slug: "ola-electric-share-price-target" },
    { name: "ONGC", slug: "ongc-share-price-target" },
    { name: "Paytm", slug: "paytm-share-price-target" },
    { name: "Reliance Industries", slug: "reliance-industries-share-price-target" },
    { name: "RVNL", slug: "rvnl-share-price-target" },
    { name: "Suzlon Energy", slug: "suzlon-energy-share-price-target" },
    { name: "SJVN", slug: "sjvn-share-price-target" },
    { name: "Tata Motors", slug: "tata-motors-share-price-target" },
    { name: "Tata Steel", slug: "tata-steel-share-price-target" },
    { name: "Tata Power", slug: "tata-power-share-price-target" },
    { name: "TCS", slug: "tcs-share-price-target" },
    { name: "Trident", slug: "trident-share-price-target" },
    { name: "Wipro", slug: "wipro-share-price-target" },
    { name: "Yes Bank", slug: "yes-bank-share-price-target" },
    { name: "Zomato", slug: "zomato-share-price-target" },
    // Aap isme aur bhi names add kar sakte hain...
  ], []);

  const filteredStocks = allStocks.filter(stock => 
    stock.name.toUpperCase().startsWith(activeLetter)
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Stock Market Directory</h1>
        <p className="text-slate-600 max-w-xl mx-auto">Explore share price targets and deep-dive technical analysis for all NSE/BSE listed companies.</p>
      </div>
      
      {/* Alphabet Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 sticky top-4 bg-white/80 backdrop-blur-md py-4 z-20 border-y shadow-sm">
        {alphabet.map(letter => (
          <button 
            key={letter} 
            onClick={() => setActiveLetter(letter)}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm border ${
              activeLetter === letter 
              ? 'bg-orange-500 text-white border-orange-500 scale-110' 
              : 'bg-white text-slate-600 hover:bg-orange-50 border-slate-200'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => (
            <Link 
              key={stock.slug} 
              href={`/stock/${stock.slug}`}
              className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-orange-400 hover:shadow-xl transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-slate-900 text-orange-400 rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                {stock.name[0]}
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-slate-800 group-hover:text-orange-600 block truncate">{stock.name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">View Forecast</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed">
            <p className="text-slate-400 text-lg">No stocks found starting with "{activeLetter}" in this section.</p>
            <p className="text-sm text-slate-300 mt-2">Try clicking another letter or check back later.</p>
          </div>
        )}
      </div>
    </main>
  );
}
