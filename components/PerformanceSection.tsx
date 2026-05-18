'use client';

import { Clock } from 'lucide-react';

interface PerformanceSectionProps {
  stock: any;
}

export default function PerformanceSection({ stock }: PerformanceSectionProps) {
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return '—';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatVolume = (vol: number | null | undefined) => {
    if (!vol) return '—';
    return vol.toLocaleString('en-IN');
  };

  // 52 Week Progress calculation
  const low52 = stock.low52 || 0;
  const high52 = stock.high52 || 0;
  const current = stock.current_price || 0;
  const progress = high52 > low52 
    ? Math.min(Math.max(((current - low52) / (high52 - low52)) * 100, 0), 100)
    : 50;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Performance</h2>
        
        {stock.last_updated && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Updated {new Date(stock.last_updated).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Today's Range & 52W Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today's Range */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">Today's Range</span>
              <span className="font-medium text-gray-900">
                {formatPrice(stock.low52)} - {formatPrice(stock.high52)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 52 Week Range */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">52 Week Range</span>
              <span className="font-medium text-gray-900">
                {formatPrice(stock.low52)} - {formatPrice(stock.high52)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-orange-500 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Other Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Open</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {formatPrice(stock.open_price || stock.current_price)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Prev Close</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {formatPrice(stock.prev_close || stock.current_price)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Volume</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {formatVolume(stock.volume)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Circuit Limits</p>
            <div className="flex justify-between text-sm">
              <span className="text-red-600 font-medium">
                L: {formatPrice(stock.lower_circuit)}
              </span>
              <span className="text-green-600 font-medium">
                U: {formatPrice(stock.upper_circuit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
