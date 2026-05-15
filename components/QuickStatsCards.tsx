'use client';
import { useState, useEffect } from 'react';

interface QuickStatsProps {
  stock: {
    pe_ratio?: number | string;
    roe?: number | string;
    roce?: number | string;
    eps?: number | string;
    dividend_yield?: number | string;
    debt_to_equity?: number | string;
    book_value?: number | string;
    face_value?: number | string;
    industry_pe?: number | string;
    sector?: string;
  };
}

export default function QuickStatsCards({ stock }: QuickStatsProps) {
  // Helper: format numbers with suffixes (Cr, Lac)
  const formatNumber = (value: string | number | undefined): string => {
    if (value === undefined || value === null || value === '') return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    if (num >= 1e7) return `${(num / 1e7).toFixed(2)} Cr`;
    if (num >= 1e5) return `${(num / 1e5).toFixed(2)} Lac`;
    return num.toFixed(2);
  };

  // Get P/E valuation verdict (for badge)
  const peRaw = stock.pe_ratio;
  let peValue: number | null = null;
  if (peRaw !== undefined && peRaw !== null && peRaw !== '') {
    const parsed = typeof peRaw === 'string' ? parseFloat(peRaw) : peRaw;
    if (!isNaN(parsed)) peValue = parsed;
  }

  let peVerdict = '';
  let peBadgeClass = '';
  if (peValue !== null) {
    if (peValue < 15) { peVerdict = 'Undervalued'; peBadgeClass = 'text-green-700 bg-green-100'; }
    else if (peValue < 25) { peVerdict = 'Fair Value'; peBadgeClass = 'text-blue-700 bg-blue-100'; }
    else if (peValue < 35) { peVerdict = 'Expensive'; peBadgeClass = 'text-orange-700 bg-orange-100'; }
    else { peVerdict = 'Very Expensive'; peBadgeClass = 'text-red-700 bg-red-100'; }
  }

  // Prepare stat items (without hidden tooltips, with visible description)
  const stats = [
    { label: 'P/E Ratio', value: peValue !== null ? peValue.toFixed(2) : 'N/A', description: 'Price to Earnings ratio - indicates valuation' },
    { label: 'ROE', value: stock.roe ? `${typeof stock.roe === 'string' ? parseFloat(stock.roe).toFixed(2) : stock.roe.toFixed(2)}%` : 'N/A', description: 'Return on Equity - profitability ratio' },
    { label: 'ROCE', value: stock.roce ? `${typeof stock.roce === 'string' ? parseFloat(stock.roce).toFixed(2) : stock.roce.toFixed(2)}%` : 'N/A', description: 'Return on Capital Employed - efficiency ratio' },
    { label: 'EPS (TTM)', value: `₹${formatNumber(stock.eps)}`, description: 'Earnings Per Share (Trailing Twelve Months)' },
    { label: 'Dividend Yield', value: stock.dividend_yield ? `${typeof stock.dividend_yield === 'string' ? parseFloat(stock.dividend_yield).toFixed(2) : stock.dividend_yield.toFixed(2)}%` : 'N/A', description: 'Annual dividend relative to share price' },
    { label: 'Debt to Equity', value: stock.debt_to_equity ? (typeof stock.debt_to_equity === 'string' ? parseFloat(stock.debt_to_equity).toFixed(2) : stock.debt_to_equity.toFixed(2)) : 'N/A', description: 'Leverage ratio - lower is better' },
  ];

  if (stock.book_value) {
    stats.push({ label: 'Book Value', value: `₹${formatNumber(stock.book_value)}`, description: 'Net asset value per share' });
  }
  if (stock.face_value) {
    stats.push({ label: 'Face Value', value: `₹${formatNumber(stock.face_value)}`, description: 'Original value of share' });
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📊</span> 
            Key Fundamentals
          </h2>
          <p className="text-sm text-gray-500 mt-1">Key financial metrics & valuation parameters</p>
        </div>
        {peVerdict && (
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${peBadgeClass}`}>
            {peVerdict}
          </span>
        )}
      </div>

      {/* Stats Cards Grid – semantic, no hidden tooltips, GSC friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900 mt-1 font-mono">{stat.value}</div>
            <div className="text-[11px] text-gray-400 mt-1 leading-tight">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Optional P/E mini progress bar (purely visual, no effect on GSC) */}
      {peValue !== null && (
        <div className="mt-5 px-1">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
              style={{ width: `${Math.min(100, (peValue / 50) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-1">
            <span>Undervalued</span>
            <span>Fair</span>
            <span>Expensive</span>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-400">
          *Data based on latest available financial reports & market data
        </p>
      </div>
    </div>
  );
}
