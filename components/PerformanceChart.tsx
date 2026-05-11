'use client';
import { useState, useEffect } from 'react';

interface PerformanceChartProps {
  symbol: string;
  stockName: string;
}

export default function PerformanceChart({ symbol, stockName }: PerformanceChartProps) {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPerformance() {
      try {
        setLoading(true);
        const res = await fetch(`/api/stock/live?symbol=${symbol}`);
        const data = await res.json();
        setPerformance(data.performance || {});
      } catch (err) {
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    }
    if (symbol) fetchPerformance();
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  const periods = [
    { label: '1 Month', key: '1M', value: performance?.oneMonth },
    { label: '3 Months', key: '3M', value: performance?.threeMonth },
    { label: '6 Months', key: '6M', value: performance?.sixMonth },
    { label: '1 Year', key: '1Y', value: performance?.oneYear }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📈</span> 
            Performance vs Benchmark
          </h2>
          <p className="text-sm text-gray-500 mt-1">Returns over different timeframes</p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          vs Nifty 50
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {periods.map((period) => {
          const value = period.value;
          const isPositive = value && value > 0;
          return (
            <div key={period.key} className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-500 uppercase tracking-wide">{period.label}</div>
              {value !== null && value !== undefined ? (
                <div className={`text-xl font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{value.toFixed(1)}%
                </div>
              ) : (
                <div className="text-xl font-bold mt-1 text-gray-400">N/A</div>
              )}
              <div className="text-[10px] text-gray-400 mt-1">vs Nifty</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center text-[10px] text-gray-400">
        *Based on historical closing prices.
      </div>
    </div>
  );
}
