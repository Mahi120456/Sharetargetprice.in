'use client';
import { useState } from 'react';

interface PriceTargetsTableProps {
  stockName: string;
  symbol: string;
  targets: Record<string, string>;
  currentPrice: number;
}

export default function PriceTargetsTable({ stockName, symbol, targets, currentPrice }: PriceTargetsTableProps) {
  const [view, setView] = useState<'table' | 'cards'>('table');

  const years = [2025, 2026, 2027, 2028, 2030, 2035, 2040, 2050];
  const basePrice = currentPrice || 100;

  const getTargetValue = (target: string): number => {
    if (!target) return basePrice;
    const numeric = parseInt(String(target).replace(/[^0-9]/g, ''));
    return isNaN(numeric) ? basePrice : numeric;
  };

  const getReturnPct = (target: string): number => {
    const targetVal = getTargetValue(target);
    return ((targetVal - basePrice) / basePrice) * 100;
  };

  const getCAGR = (target: string, year: number): number => {
    const targetVal = getTargetValue(target);
    const yearsDiff = year - 2025;
    if (yearsDiff <= 0) return 0;
    const cagr = Math.pow(targetVal / basePrice, 1 / yearsDiff) - 1;
    return cagr * 100;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{stockName} Share Price Targets (2025-2050)</h2>
          <p className="text-sm text-gray-500 mt-1">Long-term price forecasts based on fundamental analysis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${view === 'table' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            📊 Table
          </button>
          <button
            onClick={() => setView('cards')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${view === 'cards' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            🃏 Cards
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 rounded-l-xl">Year</th><th>Target Price</th><th>Potential Return</th><th className="rounded-r-xl">CAGR</th>
              </tr>
            </thead>
            <tbody>
              {years.map((year, idx) => {
                const target = targets[String(year)]; // ✅ Fix: convert number to string key
                const returnPct = getReturnPct(target);
                const cagr = getCAGR(target, year);
                return (
                  <tr key={year} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 font-bold">{year}</td>
                    <td className="p-3 font-bold text-orange-600">{target || 'N/A'}</td>
                    <td className={`p-3 font-semibold ${returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(0)}%
                    </td>
                    <td className="p-3 text-blue-600">{cagr > 0 ? `${cagr.toFixed(1)}%` : 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto p-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {years.map((year) => {
              const target = targets[String(year)];
              const returnPct = getReturnPct(target);
              return (
                <div key={year} className="w-56 bg-gradient-to-br from-gray-50 to-white border p-4 rounded-xl shadow-sm flex-shrink-0">
                  <div className="text-sm text-gray-500">Target {year}</div>
                  <div className="text-2xl font-bold text-orange-600 mt-1">{target || 'N/A'}</div>
                  <div className={`text-xs font-semibold mt-2 ${returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {returnPct >= 0 ? '↑' : '↓'} {Math.abs(returnPct).toFixed(0)}% from current
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-3">
                    <div className="h-1.5 bg-orange-500 rounded-full" style={{ width: `${Math.min(100, Math.abs(returnPct))}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center border-t">
        *Targets are based on earnings growth projections and sector analysis. Not investment advice.
      </div>
    </div>
  );
}
