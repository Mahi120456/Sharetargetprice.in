'use client';

interface TopMutualFundsProps {
  holdings: any[];
}

export default function TopMutualFunds({ holdings }: TopMutualFundsProps) {
  if (!holdings || holdings.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Top Mutual Funds Holding</h2>
      <div className="space-y-2">
        {holdings.slice(0, 5).map((fund, idx) => (
          <div key={idx} className="flex justify-between border-b py-2">
            <span>{fund.holder || fund.name}</span>
            <span>{(fund.percentage * 100).toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
