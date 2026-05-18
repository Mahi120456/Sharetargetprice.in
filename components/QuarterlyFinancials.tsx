'use client';

interface QuarterlyFinancialsProps {
  quarterlyData: any[];
}

export default function QuarterlyFinancials({ quarterlyData }: QuarterlyFinancialsProps) {
  if (!quarterlyData || quarterlyData.length === 0) return null;
  const recent = quarterlyData.slice(0, 5);
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quarterly Financials (₹ in Crores)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Quarter</th>
              <th className="text-right py-2">Revenue</th>
              <th className="text-right py-2">Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((q, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{q.date || q.calendarYear}</td>
                <td className="text-right py-2">₹{(q.revenue / 1e7).toFixed(2)} Cr</td>
                <td className="text-right py-2">₹{(q.netIncome / 1e7).toFixed(2)} Cr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
