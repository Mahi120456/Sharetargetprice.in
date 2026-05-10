'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AllStocks() {
  const [activeLetter, setActiveLetter] = useState('A');
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Sample Data (Bhai yahan aap apni list extend kar sakte ho)
  // Main niche logic de raha hoon jisse ye auto-filter hoga
  const allStocks = [
    { name: "Adani Power", slug: "adani-power-share-price-target" },
    { name: "Alok Industries", slug: "alok-industries-share-price-target" },
    { name: "BSE Ltd", slug: "bse-share-price-target" },
    { name: "HDFC Bank", slug: "hdfc-bank-share-price-target" },
    { name: "IRFC", slug: "irfc-share-price-target" },
    { name: "IREDA", slug: "ireda-share-price-target" },
    { name: "ITC", slug: "itc-share-price-target" },
    { name: "Reliance", slug: "reliance-share-price-target" },
    { name: "RVNL", slug: "rvnl-share-price-target" },
    { name: "Suzlon", slug: "suzlon-share-price-target" },
    { name: "Tata Motors", slug: "tata-motors-share-price-target" },
    { name: "Tata Steel", slug: "tata-steel-share-price-target" },
    { name: "Wipro", slug: "wipro-share-price-target" },
    { name: "Zomato", slug: "zomato-share-price-target" },
  ];

  // Filter stocks based on selected letter
  const filteredStocks = allStocks.filter(stock => 
    stock.name.toUpperCase().startsWith(activeLetter)
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Stock Directory (A-Z)</h1>
        <p className="text-gray-600">Find share price targets for 3000+ NSE & BSE listed companies.</p>
      </div>
      
      {/* A-Z Filter Bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 sticky top-20 bg-gray-50 py-4 z-10">
        {alphabet.map(letter => (
          <button 
            key={letter} 
            onClick={() => setActiveLetter(letter)}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm border ${
              activeLetter === letter 
              ? 'bg-blue-600 text-white border-blue-600 scale-110' 
              : 'bg-white text-gray-600 hover:bg-blue-50 border-gray-200'
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
              className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                {stock.name[0]}
              </div>
              <div>
                <span className="font-bold text-gray-800 group-hover:text-blue-600 block">{stock.name}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Prediction Available</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400">
            No stocks found starting with "{activeLetter}" in this preview.
          </div>
        )}
      </div>

      {/* SEO Content Footer */}
      <div className="mt-20 border-t pt-10 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">How to find your stock?</h2>
        <p className="max-w-2xl mx-auto text-gray-500 text-sm">
          Aap kisi bhi stock ka naam alphabetical list mein dhoond sakte hain. Har page par aapko automatic technical analysis, live price aur future targets (2025, 2030, 2050) milenge.
        </p>
      </div>
    </main>
  );
}
