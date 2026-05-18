'use client';

interface QuarterlyFinancialsProps {
  quarterlyData: any[];
}

export default function QuarterlyFinancials({ quarterlyData }: QuarterlyFinancialsProps) {
  if (!quarterlyData || quarterlyData.length === 0) {
    return null;
  }

  // Sirf last 5 quarters lo
  const recentData = [...quarterlyData].reverse().slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Quarterly Financials</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-600 font-medium">Quarter</th>
              <th className="text-right py-2 text-gray-600 font-medium">Revenue (Cr)</th>
              <th className="text-right py-2 text-gray-600 font-medium">Profit (Cr)</th>
              <th className="text-right py-2 text-gray-600 font-medium">EPS</th>
            </tr>
          </thead>
          <tbody>
            {recentData.map((q, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-none">
                <td className="py-3 text-gray-800 font-medium">
                  {new Date(q.quarter).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </td>
                <td className="py-3 text-right font-medium text-gray-900">
                  {q.revenue_cr ? q.revenue_cr.toLocaleString('en-IN') : '—'}
                </td>
                <td className="py-3 text-right font-medium text-gray-900">
                  {q.profit_cr ? q.profit_cr.toLocaleString('en-IN') : '—'}
                </td>
                <td className="py-3 text-right font-medium text-gray-900">
                  {q.eps || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Latest quarterly results
      </p>
    </div>
  );
}
