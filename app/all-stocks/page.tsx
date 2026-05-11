'use client';
export const dynamic = 'force-dynamic';   // 👈 ADD THIS LINE

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, ArrowUp, X } from 'lucide-react';

// ... rest of your code remains exactly the same (StockDirectory component and default export)
// Client component with search and alphabet filter
function StockDirectory() {
  const [activeLetter, setActiveLetter] = useState('A');
  const [stocks, setStocks] = useState<any[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Fetch all stocks once
  useEffect(() => {
    async function fetchAllStocks() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('stocks')
          .select('name, slug, sector, symbol');

        if (error) throw error;
        setStocks(data || []);
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
        setError("Unable to load stock directory. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    fetchAllStocks();
  }, []);

  // Filter by active letter and search query
  useEffect(() => {
    let filtered = [...stocks];
    
    // Filter by letter (first character)
    if (activeLetter) {
      filtered = filtered.filter(stock => 
        stock.name.trim().charAt(0).toUpperCase() === activeLetter
      );
    }
    
    // Filter by search query (name or symbol)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(stock =>
        stock.name.toLowerCase().includes(query) ||
        (stock.symbol && stock.symbol.toLowerCase().includes(query))
      );
    }
    
    setFilteredStocks(filtered);
  }, [stocks, activeLetter, searchQuery]);

  const handleLetterClick = (letter: string) => {
    setActiveLetter(letter);
    setSearchQuery(''); // clear search when clicking alphabet
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Get count of stocks per letter (for badge)
  const stockCountByLetter = useMemo(() => {
    const counts: Record<string, number> = {};
    stocks.forEach(stock => {
      const letter = stock.name.trim().charAt(0).toUpperCase();
      counts[letter] = (counts[letter] || 0) + 1;
    });
    return counts;
  }, [stocks]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <div className="text-center mb-12">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2"></div>
          <div className="h-5 w-64 bg-gray-100 rounded animate-pulse mx-auto"></div>
        </div>
        <div className="sticky top-4 z-40 mb-12">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {alphabet.map(letter => (
                <div key={letter} className="w-11 h-11 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen text-center">
        <div className="text-red-500 text-2xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">
          A-Z <span className="text-orange-500">Stock</span> Directory
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Browse share price targets and analysis for {stocks.length}+ Indian stocks. 
          Select a letter or search by company name.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by company name or symbol..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setActiveLetter(''); // clear letter filter when searching
              else setActiveLetter('A');
            }}
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 text-gray-700 bg-white shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {searchQuery && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Alphabet Bar – sticky with backdrop blur */}
      <div className="sticky top-4 z-40 mb-12">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-3xl p-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 pb-1">
            {alphabet.map(letter => {
              const count = stockCountByLetter[letter] || 0;
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className={`flex-shrink-0 min-w-[44px] h-12 flex flex-col items-center justify-center rounded-2xl font-bold transition-all duration-300 ${
                    activeLetter === letter && !searchQuery
                      ? 'bg-slate-900 text-orange-400 scale-105 shadow-md'
                      : 'bg-white text-slate-400 hover:bg-orange-50 border border-slate-100'
                  }`}
                >
                  <span className="text-base">{letter}</span>
                  {count > 0 && (
                    <span className={`text-[9px] font-mono ${activeLetter === letter && !searchQuery ? 'text-orange-400' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
          {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''} found
          {searchQuery && (
            <span className="ml-2 text-orange-500">for "{searchQuery}"</span>
          )}
        </div>
        {activeLetter && !searchQuery && (
          <div className="text-xs text-gray-400">
            Showing stocks starting with <strong className="text-gray-600">{activeLetter}</strong>
          </div>
        )}
      </div>

      {/* Stocks Grid */}
      {filteredStocks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">No stocks found</h3>
          <p className="text-gray-500 text-sm">
            {searchQuery 
              ? `No matches for "${searchQuery}". Try another keyword.` 
              : `No stocks starting with "${activeLetter}".`}
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setActiveLetter('A');
            }}
            className="mt-4 px-4 py-2 text-orange-500 text-sm font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStocks.map((stock) => (
            <Link
              key={stock.slug}
              href={`/stock/${stock.slug}-share-price-target`}
              className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Stock initial badge */}
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                  {stock.name.trim()[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-gray-800 group-hover:text-orange-600 truncate text-sm uppercase tracking-wide">
                    {stock.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                      {stock.sector || 'General'}
                    </span>
                    {stock.symbol && (
                      <span className="text-[9px] text-gray-400 font-mono">
                        {stock.symbol}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Decorative line on hover */}
              <div className="mt-3 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 w-0 group-hover:w-full transition-all duration-300 rounded-full"></div>
            </Link>
          ))}
        </div>
      )}

      {/* Back to top button (appears after scrolling) – optional */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-orange-500 transition-all z-50"
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* Hide scrollbar utility */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// Wrap with Suspense and export
export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-gray-500">Loading directory...</div>}>
      <StockDirectory />
    </Suspense>
  );
}
