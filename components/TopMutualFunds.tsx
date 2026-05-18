'use client';

interface TopMutualFundsProps {
  holdings: any[];
}

export default function TopMutualFunds({ holdings }: TopMutualFundsProps) {
  if (!holdings || holdings.length === 0) {
    return null;
  }

  // Sirf top 5 holdings dikhao
  const topHoldings = holdings.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Top Institutional Holdings</h2>

      <div className="space-y-3">
        {topHoldings.map((holding, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div>
              <p className="font-medium text-gray-900">{holding.institution_name}</p>
              <p className="text-xs text-gray-500">
                {holding.shares_held_cr ? `${holding.shares_held_cr} Cr shares` : ''}
              </p>
            </div>
            <div className="text-right">
              {holding.change_pct !== null && holding.change_pct !== undefined && (
                <span className={`text-sm font-medium ${holding.change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.change_pct >= 0 ? '+' : ''}{holding.change_pct}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
