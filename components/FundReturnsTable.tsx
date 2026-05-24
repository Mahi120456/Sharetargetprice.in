'use client';

interface ReturnsData {
  period: string;
  fundReturn: number | null;
  categoryAvg: number | null;
  rank?: number;
}

interface FundReturnsTableProps {
  returns: ReturnsData[];
  fundName: string;
}

export default function FundReturnsTable({ returns, fundName }: FundReturnsTableProps) {
  if (!returns || returns.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Returns & Rankings</h2>
        <p className="text-gray-500 text-sm">Returns data not available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Returns & Rankings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-600">Period</th>
              <th className="text-right py-2 font-semibold text-gray-600">Fund Returns (%)</th>
              <th className="text-right py-2 font-semibold text-gray-600">Category Avg. (%)</th>
              <th className="text-right py-2 font-semibold text-gray-600">Rank</th>
             </tr>
          </thead>
          <tbody>
            {returns.map((r, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2 font-medium text-gray-700">{r.period}</td>
                <td className={`py-2 text-right font-medium ${r.fundReturn && r.fundReturn > 0 ? 'text-green-600' : r.fundReturn && r.fundReturn < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {r.fundReturn ? `${r.fundReturn.toFixed(2)}%` : 'N/A'}
                </td>
                <td className="py-2 text-right text-gray-600">{r.categoryAvg ? `${r.categoryAvg.toFixed(2)}%` : 'N/A'}</td>
                <td className="py-2 text-right text-gray-600">{r.rank ? `#${r.rank}` : 'N/A'}</td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-gray-400 text-center">
        *Based on latest available data
      </div>
    </div>
  );
}
