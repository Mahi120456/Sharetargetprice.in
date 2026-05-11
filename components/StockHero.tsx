'use client';
import { useState, useEffect, useCallback } from 'react';

interface StockData {
  price: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  prevClose: number | null;
  volume: number | null;
  high52: number | null;
  low52: number | null;
  marketCap: number | null;
}

export default function StockHero({ name, symbol }: { name: string; symbol: string }) {
  const [stockData, setStockData] = useState<StockData>({
    price: null,
    change: null,
    changePercent: null,
    open: null,
    high: null,
    low: null,
    prevClose: null,
    volume: null,
    high52: null,
    low52: null,
    marketCap: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch(`/api/stock/live?symbol=${symbol}`);
      const data = await res.json();
      setStockData({
        price: data.price || null,
        change: data.change || null,
        changePercent: data.changePercent || null,
        open: data.open || null,
        high: data.high || null,
        low: data.low || null,
        prevClose: data.prevClose || null,
        volume: data.volume || null,
        high52: data.high52 || null,
        low52: data.low52 || null,
        marketCap: data.marketCap || null,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const isPositive = (stockData.changePercent || 0) >= 0;
  const priceChangeClass = isPositive ? 'text-green-600' : 'text-red-600';
  const priceChangeIcon = isPositive ? '▲' : '▼';

  // Calculate 52-week position percentage
  const fiftyTwoWeekPosition = (stockData.high52 && stockData.low52 && stockData.price)
    ? ((stockData.price - stockData.low52) / (stockData.high52 - stockData.low52)) * 100
    : 0;

  // Format large numbers
  const formatNumber = (num: number | null) => {
    if (!num) return 'N/A';
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)} Cr`;
    if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)} Lac`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatVolume = (vol: number | null) => {
    if (!vol) return 'N/A';
    if (vol >= 1e7) return `${(vol / 1e7).toFixed(2)} Cr`;
    if (vol >= 1e5) return `${(vol / 1e5).toFixed(2)} Lac`;
    return vol.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 mb-8 animate-pulse">
        <div className="h-32 bg-slate-700 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden mb-8">
      {/* Main Hero Content */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          
          {/* Left Side - Company Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                NSE: {symbol}
              </span>
              <span className="bg-slate-600 text-gray-300 text-xs px-3 py-1 rounded-full">
                Share Price Target
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {name}
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Long-term price targets, fundamental analysis, and investment outlook
            </p>
          </div>

          {/* Right Side - Live Price Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 min-w-[200px] border border-white/20">
            <div className="text-center">
              <div className="text-gray-300 text-xs uppercase tracking-wider mb-1">Live Price</div>
              <div className="text-4xl md:text-5xl font-black text-white font-mono">
                ₹{stockData.price?.toFixed(2) || '---'}
              </div>
              {stockData.changePercent !== null && (
                <div className={`flex items-center justify-center gap-1 mt-1 font-semibold ${priceChangeClass}`}>
                  <span className="text-lg">{priceChangeIcon}</span>
                  <span>{Math.abs(stockData.changePercent).toFixed(2)}%</span>
                  <span className="text-gray-400 text-sm ml-1">
                    (₹{Math.abs(stockData.change || 0).toFixed(2)})
                  </span>
                </div>
              )}
              <div className="text-gray-400 text-[10px] mt-2">
                Updated: {lastUpdated.toLocaleTimeString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase">Open</div>
            <div className="text-white font-semibold">₹{stockData.open?.toFixed(2) || '---'}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase">High/Low</div>
            <div className="text-white font-semibold text-sm">
              {stockData.high?.toFixed(2)} / {stockData.low?.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase">Prev Close</div>
            <div className="text-white font-semibold">₹{stockData.prevClose?.toFixed(2) || '---'}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase">Volume</div>
            <div className="text-white font-semibold text-sm">{formatVolume(stockData.volume)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase">Market Cap</div>
            <div className="text-white font-semibold text-sm">{formatNumber(stockData.marketCap)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase">52W Range</div>
            <div className="text-white font-semibold text-sm">
              {stockData.low52?.toFixed(0)} - {stockData.high52?.toFixed(0)}
            </div>
          </div>
        </div>

        {/* 52 Week Range Progress Bar */}
        {stockData.high52 && stockData.low52 && stockData.price && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>52W Low: ₹{stockData.low52.toFixed(2)}</span>
              <span className="text-orange-400 font-medium">{fiftyTwoWeekPosition.toFixed(0)}% from low</span>
              <span>52W High: ₹{stockData.high52.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${fiftyTwoWeekPosition}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Market Status Bar */}
      <div className="bg-black/30 px-6 py-2 text-center">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-400">Market Status:</span>
            <span className="text-green-400 font-medium">Live & Active</span>
          </div>
          <div className="text-gray-500">|</div>
          <div className="text-gray-400">
            Last Updated: {lastUpdated.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
}
