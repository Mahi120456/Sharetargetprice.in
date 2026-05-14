'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StockMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export default function MarketMovers() {
  const [gainers, setGainers] = useState<StockMover[]>([]);
  const [losers, setLosers] = useState<StockMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchMarketMovers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/market-movers');
      const data = await response.json();

      if (data.success) {
        setGainers(data.gainers);
        setLosers(data.losers);
        setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString('en-IN'));
      } else {
        setError('Failed to fetch market data');
      }
    } catch (err) {
      setError('Unable to load market movers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketMovers();
    // Refresh every 15 minutes
    const interval = setInterval(fetchMarketMovers, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchMarketMovers}
          className="mt-4 text-orange-500 text-sm hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentData = activeTab === 'gainers' ? gainers : losers;
  const isGainers = activeTab === 'gainers';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="font-bold text-xl text-gray-900">Market Movers</h3>
          </div>
          <div className="text-xs text-gray-400">
            Updated: {lastUpdated || 'Loading...'}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'gainers'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🚀 Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'losers'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📉 Top Losers
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {currentData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No data available
          </div>
        ) : (
          currentData.slice(0, 6).map((stock, idx) => (
            <Link
              key={stock.symbol}
              href={`/stock/${stock.symbol.toLowerCase()}-share-price-target`}
              className="block p-4 hover:bg-orange-50 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 group-hover:text-orange-600">
                      {stock.symbol}
                    </span>
                    <span className="text-xs text-gray-400 line-clamp-1">
                      {stock.name.length > 25 ? stock.name.slice(0, 25) + '...' : stock.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Vol: {(stock.volume / 100000).toFixed(1)}L
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    ₹{stock.price.toFixed(2)}
                  </div>
                  <div className={`text-sm font-semibold ${isGainers ? 'text-green-600' : 'text-red-600'}`}>
                    {isGainers ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
        Real-time data • Updates every 15 minutes
      </div>
    </div>
  );
}
