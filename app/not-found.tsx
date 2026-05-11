import Link from "next/link";
import { ArrowLeft, Home, Search, TrendingUp } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Animated 404 icon */}
        <div className="relative mb-8">
          <div className="text-9xl mb-2 animate-bounce">📉</div>
          <div className="absolute top-0 right-1/4 text-5xl animate-ping opacity-20">🔍</div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-4 tracking-tighter">
          404
        </h1>
        
        <div className="inline-block bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          Page Not Found
        </div>
        
        <p className="text-xl text-gray-600 mb-2">
          Oops! Yeh page nahi mila!
        </p>
        <p className="text-gray-500 mb-8">
          Stock ki tarah delist ho gaya 😅 <br />
          Ho sakta hai URL galat ho ya page shift kar diya gaya ho.
        </p>

        {/* Quick suggestion: check stock directory */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Search size={18} className="text-orange-500" />
            <span className="font-medium text-sm">Try searching for a stock:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["RELIANCE", "TCS", "HDFCBANK", "IRFC", "SUZLON"].map(sym => (
              <Link 
                key={sym}
                href={`/stock/${sym.toLowerCase()}-share-price-target`}
                className="text-xs bg-gray-100 hover:bg-orange-100 px-3 py-1.5 rounded-full transition"
              >
                {sym}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <Home size={18} /> Back to Home
          </Link>
          <Link
            href="/all-stocks"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <TrendingUp size={18} /> Browse All Stocks
          </Link>
          <Link
            href="/category/calculator"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            🧮 Calculators
          </Link>
        </div>

        {/* Go back link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-orange-500 mt-8 transition"
        >
          <ArrowLeft size={14} /> Go back to previous page
        </button>

        {/* Decorative element */}
        <div className="mt-12 text-xs text-gray-300">
          lost? let us guide you back to our financial universe.
        </div>
      </div>
    </div>
  );
}
