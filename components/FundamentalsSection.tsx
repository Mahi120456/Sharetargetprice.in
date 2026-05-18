'use client';

interface FundamentalsSectionProps {
  stock: any;
}

export default function FundamentalsSection({ stock }: FundamentalsSectionProps) {
  const formatValue = (value: number | null | undefined, suffix = '') => {
    if (value === null || value === undefined || value === 0) return '—';
    return `\( {value.toLocaleString('en-IN')} \){suffix}`;
  };

  const metrics = [
    { label: 'Market Cap', value: formatValue(stock.market_cap, ' Cr') },
    { label: 'P/E Ratio (TTM)', value: formatValue(stock.pe_ratio) },
    { label: 'EPS (TTM)', value: formatValue(stock.eps, ' ₹') },
    { label: 'ROE', value: formatValue(stock.roe, '%') },
    { label: 'ROCE', value: formatValue(stock.roce, '%') },
    { label: 'Book Value', value: formatValue(stock.book_value, ' ₹') },
    { label: 'Debt to Equity', value: formatValue(stock.debt_to_equity) },
    { label: 'Dividend Yield', value: formatValue(stock.dividend_yield, '%') },
    { label: '52W High', value: formatValue(stock.high52, ' ₹') },
    { label: '52W Low', value: formatValue(stock.low52, ' ₹') },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Key Fundamentals</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
          >
            <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
            <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-400 mt-4">
        Data may be delayed. For latest figures, please check official filings.
      </p>
    </div>
  );
}
