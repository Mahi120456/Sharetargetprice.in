'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, ArrowUp, X, ArrowLeft, Filter, ChevronDown } from 'lucide-react';

type Stock = {
  name: string;
  symbol: string;
  sector: string | null;
  current_price: number | null;
  market_cap: number | null;
  pe_ratio: number | null;
  roe: number | null;
  target_2026?: string | null;
  slug: string;
  is_new?: boolean;
};

function StockDirectory() {
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [marketCapRange, setMarketCapRange] = useState<string>('');
  const [peRange, setPeRange] = useState<string>('');
  const [roeRange, setRoeRange] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique sectors for dropdown
  const sectors = useMemo(() => {
    const unique = new Set<string>();
    stocks.forEach(s => s.sector && unique.add(s.sector));
    return Array.from(unique).sort();
  }, [stocks]);

  // Fetch all stocks (old + new)
  useEffect(() => {
    async function fetchAllStocks() {
      setLoading(true);
      setError(null);
      try {
        // 1. Old stocks from 'stocks' table
        const { data: oldStocks, error: oldError } = await supabase
          .from('stocks')
          .select('name, symbol, sector, current_price, market_cap, pe_ratio, roe, target_2026, slug');
        if (oldError) throw oldError;

        // 2. New stocks from 'stocks_csv_data'
        const { data: newStocks, error: newError } = await supabase
          .from('stocks_csv_data')
          .select('name, symbol, sector, current_price, market_cap, pe_ratio, roe, target_2026');
        if (newError) throw newError;

        // Transform new stocks
        const transformedNew: Stock[] = (newStocks || []).map((item: any) => ({
          name: item.name,
          symbol: item.symbol,
          sector: item.sector,
          current_price: item.current_price ? parseFloat(item.current_price) : null,
          market_cap: item.market_cap ? parseFloat(item.market_cap) : null,
          pe_ratio: item.pe_ratio ? parseFloat(item.pe_ratio) : null,
          roe: item.roe ? parseFloat(item.roe) : null,
          target_2026: item.target_2026,
          slug: `${item.symbol.toLowerCase()}-share-price-target-2026-to-2050`,
          is_new: true,
        }));

        // Merge, remove duplicates by symbol (old takes precedence)
        const oldSymbols = new Set((oldStocks || []).map(s => s.symbol));
        const filteredNew = transformedNew.filter(s => !oldSymbols.has(s.symbol));

        const allStocks = [...(oldStocks || []), ...filteredNew];
        setStocks(allStocks);
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
        setError("Unable to load stock directory. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    fetchAllStocks();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...stocks];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.symbol && s.symbol.toLowerCase().includes(q))
      );
    }

    // Sector filter
    if (selectedSector) {
      filtered = filtered.filter(s => s.sector === selectedSector);
    }

    // Market Cap filter (in Crores)
    if (marketCapRange) {
      const [min, max] = marketCapRange.split('-').map(v => v === '+' ? Infinity : parseFloat(v));
      filtered = filtered.filter(s => {
        const cap = s.market_cap;
        if (!cap) return false;
        if (max === Infinity) return cap >= min;
        return cap >= min && cap <= max;
      });
    }

    // P/E Ratio filter
    if (peRange) {
      const [min, max] = peRange.split('-').map(v => v === '+' ? Infinity : parseFloat(v));
      filtered = filtered.filter(s => {
        const pe = s.pe_ratio;
        if (!pe) return false;
        if (max === Infinity) return pe >= min;
        return pe >= min && pe <= max;
      });
    }

    // ROE filter (%)
    if (roeRange) {
      const [min, max] = roeRange.split('-').map(v => v === '+' ? Infinity : parseFloat(v));
      filtered = filtered.filter(s => {
        const roe = s.roe;
        if (!roe) return false;
        if (max === Infinity) return roe >= min;
        return roe >= min && roe <= max;
      });
    }

    setFilteredStocks(filtered);
  }, [stocks, searchQuery, selectedSector, marketCapRange, peRange, roeRange]);

  const clearFilters = () => {
    setSelectedSector('');
    setMarketCapRange('');
    setPeRange('');
    setRoeRange('');
    setSearchQuery('');
  };

  const formatMarketCap = (value: number | null) => {
    if (!value) return '—';
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L Cr`;
    if (value >= 100) return `₹${(value / 100).toFixed(1)}K Cr`;
    return `₹${value.toFixed(0)} Cr`;
  };

  const formatPrice = (value: number | null) => value ? `₹${value.toLocaleString('en-IN')}` : '—';
  const formatPercent = (value: number | null) => value ? `${value.toFixed(1)}%` : '—';
  const formatPE = (value: number | null) => value ? value.toFixed(1) : '—';

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading stocks...</div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-orange-500 text-white rounded-full">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-orange-500 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="w-20"></div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">Stock Directory</h1>
        <p className="text-gray-500 mt-1">{filteredStocks.length} stocks • Real-time data</p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by company name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-300 bg-white shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-orange-50"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Sectors</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Market Cap (Cr)</label>
            <select
              value={marketCapRange}
              onChange={(e) => setMarketCapRange(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">Any</option>
              <option value="0-5000">Under ₹5,000 Cr</option>
              <option value="5000-20000">₹5,000 - ₹20,000 Cr</option>
              <option value="20000-100000">₹20,000 - ₹1L Cr</option>
              <option value="100000-+">₹1L Cr+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">P/E Ratio</label>
            <select
              value={peRange}
              onChange={(e) => setPeRange(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">Any</option>
              <option value="0-15">Under 15</option>
              <option value="15-25">15 - 25</option>
              <option value="25-40">25 - 40</option>
              <option value="40-+">Above 40</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ROE (%)</label>
            <select
              value={roeRange}
              onChange={(e) => setRoeRange(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">Any</option>
              <option value="0-10">Under 10%</option>
              <option value="10-18">10% - 18%</option>
              <option value="18-25">18% - 25%</option>
              <option value="25-+">Above 25%</option>
            </select>
          </div>
          {(selectedSector || marketCapRange || peRange || roeRange || searchQuery) && (
            <div className="flex items-end">
              <button onClick={clearFilters} className="text-orange-500 text-sm font-medium hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      )}

      {/* Stock Cards Grid */}
      {filteredStocks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-gray-500">No stocks match your filters.</p>
          <button onClick={clearFilters} className="mt-3 text-orange-500 text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStocks.map((stock) => {
            // Compute upside from target_2026 if available
            let upside = null;
            if (stock.target_2026 && stock.current_price && stock.current_price > 0) {
              const targetNum = parseFloat(String(stock.target_2026).replace(/[^0-9.-]/g, ''));
              if (!isNaN(targetNum)) {
                upside = ((targetNum - stock.current_price) / stock.current_price) * 100;
              }
            }
            return (
              <Link
                key={stock.slug}
                href={`/stock/${stock.slug}`}
                className="group bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-gray-800 group-hover:text-orange-600 transition line-clamp-1">
                        {stock.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{stock.symbol}</p>
                    </div>
                    {stock.is_new && (
                      <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Basic</span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="font-semibold text-gray-800">{formatPrice(stock.current_price)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Market Cap</p>
                      <p className="font-semibold text-gray-800">{formatMarketCap(stock.market_cap)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">P/E</p>
                      <p className="font-semibold text-gray-800">{formatPE(stock.pe_ratio)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">ROE</p>
                      <p className="font-semibold text-gray-800">{formatPercent(stock.roe)}</p>
                    </div>
                  </div>
                  {stock.sector && (
                    <div className="mt-2">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{stock.sector}</span>
                    </div>
                  )}
                  {upside !== null && (
                    <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-[10px] text-gray-400">Upside (2026)</span>
                      <span className={`text-xs font-bold ${upside >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="text-orange-500 text-xs font-medium group-hover:underline">View Analysis →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-orange-500 transition-all"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-gray-500">Loading directory...</div>}>
      <StockDirectory />
    </Suspense>
  );
}
