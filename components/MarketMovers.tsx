'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StockMover {
  symbol: string;
  name: string;
  slug: string;        // 👈 added slug
  price: number;
  change: number;
  changePercent: number;
}

export default function MarketMovers() {
  const [stocks, setStocks] = useState<StockMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/market-movers');
      const data = await res.json();
      if (data.success) {
        setStocks(data.stocks);
        setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString('en-IN'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h3 className="font-bold text-xl text-gray-900">Favorite Stocks</h3>
          </div>
          <div className="text-xs text-gray-400">Updated: {lastUpdated}</div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {stocks.map((stock) => (
          <Link
            key={stock.symbol}
            href={`/stock/${stock.slug}-share-price-target`}   // ✅ sahi slug + suffix
            className="block p-4 hover:bg-orange-50 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800 group-hover:text-orange-600">
                  {stock.symbol}
                </div>
                <div className="text-xs text-gray-400">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">₹{stock.price.toFixed(2)}</div>
                <div className={`text-sm font-semibold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
