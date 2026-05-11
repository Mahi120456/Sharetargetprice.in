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

interface StatCard {
  label: string;
  value: string | number;
  tooltip: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  benchmark?: string;
}

export default function QuickStatsCards({ stock }: QuickStatsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Format numbers with proper suffixes
  const formatNumber = (value: string | number | undefined) => {
    if (!value) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return value;
    
    if (num >= 1e7) return `${(num / 1e7).toFixed(2)} Cr`;
    if (num >= 1e5) return `${(num / 1e5).toFixed(2)} Lac`;
    return num.toFixed(2);
  };

  // Get valuation verdict
  const getPEMessage = (pe: number | undefined) => {
    if (!pe) return null;
    if (pe < 15) return { text: 'Undervalued', color: 'text-green-600 bg-green-50' };
    if (pe < 25) return { text: 'Fair Value', color: 'text-blue-600 bg-blue-50' };
    if (pe < 35) return { text: 'Expensive', color: 'text-orange-600 bg-orange-50' };
    return { text: 'Very Expensive', color: 'text-red-600 bg-red-50' };
  };

  const peMessage = getPEMessage(typeof stock.pe_ratio === 'string' ? parseFloat(stock.pe_ratio) : stock.pe_ratio);

  const statCards: StatCard[] = [
    {
      label: 'P/E Ratio',
      value: stock.pe_ratio ? (typeof stock.pe_ratio === 'string' ? parseFloat(stock.pe_ratio).toFixed(2) : stock.pe_ratio.toFixed(2)) : 'N/A',
      tooltip: 'Price to Earnings ratio - indicates valuation',
      icon: '📊',
      color: 'from-blue-500 to-blue-600',
      benchmark: stock.industry_pe ? `Industry: ${stock.industry_pe}` : undefined
    },
    {
      label: 'ROE',
      value: stock.roe ? `${typeof stock.roe === 'string' ? parseFloat(stock.roe).toFixed(2) : stock.roe.toFixed(2)}%` : 'N/A',
      tooltip: 'Return on Equity - profitability ratio',
      icon: '📈',
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'ROCE',
      value: stock.roce ? `${typeof stock.roce === 'string' ? parseFloat(stock.roce).toFixed(2) : stock.roce.toFixed(2)}%` : 'N/A',
      tooltip: 'Return on Capital Employed - efficiency ratio',
      icon: '⚙️',
      color: 'from-teal-500 to-teal-600',
    },
    {
      label: 'EPS (TTM)',
      value: `₹${formatNumber(stock.eps)}`,
      tooltip: 'Earnings Per Share (Trailing Twelve Months)',
      icon: '💰',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Dividend Yield',
      value: stock.dividend_yield ? `${typeof stock.dividend_yield === 'string' ? parseFloat(stock.dividend_yield).toFixed(2) : stock.dividend_yield.toFixed(2)}%` : 'N/A',
      tooltip: 'Annual dividend relative to share price',
      icon: '💵',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      label: 'Debt to Equity',
      value: stock.debt_to_equity ? (typeof stock.debt_to_equity === 'string' ? parseFloat(stock.debt_to_equity).toFixed(2) : stock.debt_to_equity.toFixed(2)) : 'N/A',
      tooltip: 'Leverage ratio - lower is better',
      icon: '🏦',
      color: 'from-red-500 to-red-600',
    },
  ];

  // Add optional fields if available
  if (stock.book_value) {
    statCards.push({
      label: 'Book Value',
      value: `₹${formatNumber(stock.book_value)}`,
      tooltip: 'Net asset value per share',
      icon: '📚',
      color: 'from-indigo-500 to-indigo-600',
    });
  }

  if (stock.face_value) {
    statCards.push({
      label: 'Face Value',
      value: `₹${formatNumber(stock.face_value)}`,
      tooltip: 'Original value of share',
      icon: '🎯',
      color: 'from-pink-500 to-pink-600',
    });
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📊</span> 
            Key Fundamentals
          </h2>
          <p className="text-sm text-gray-500 mt-1">Key financial metrics & valuation parameters</p>
        </div>
        
        {/* PE Verdict Badge */}
        {peMessage && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${peMessage.color}`}>
            {peMessage.text}
          </div>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className="relative group"
            onMouseEnter={() => setHoveredCard(card.label)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className={`
              relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 
              transition-all duration-300 hover:shadow-md hover:border-orange-200
              ${hoveredCard === card.label ? 'transform -translate-y-0.5' : ''}
            `}>
              {/* Icon & Label */}
              <div className="flex items-start justify-between mb-2">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-lg
                  bg-gradient-to-br ${card.color} bg-opacity-10
                `}>
                  {card.icon}
                </div>
                {card.benchmark && (
                  <div className="group-hover:opacity-100 opacity-0 transition-opacity">
                    <div className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {card.benchmark}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Value */}
              <div className="mt-2">
                <div className="text-lg md:text-xl font-bold text-gray-900 font-mono">
                  {card.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <span className="capitalize">{card.label}</span>
                  {/* Tooltip icon */}
                  <div className="relative group/tooltip">
                    <span className="cursor-help text-gray-400 text-[10px] ml-0.5">ⓘ</span>
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                        {card.tooltip}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini progress bar for PE (visual indicator) */}
              {card.label === 'P/E Ratio' && typeof stock.pe_ratio === 'number' && (
                <div className="mt-3">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                      style={{ width: `${Math.min(100, (stock.pe_ratio / 50) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                    <span>Value</span>
                    <span>Expensive</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Note & Source */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-400">
          *Data based on latest available financial reports & market data
        </p>
      </div>
    </div>
  );
}
