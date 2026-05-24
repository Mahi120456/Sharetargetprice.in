'use client';

interface Holding {
  name: string;
  percentage: number;
  asset_type?: string;
}

interface HoldingsTableProps {
  holdings: Holding[];
  fundName: string;
}

export default function HoldingsTable({ holdings, fundName }: HoldingsTableProps) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Holdings</h2>
        <p className="text-gray-500 text-sm">Holdings data not available for this fund.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Holdings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-600">Holding Name</th>
              <th className="text-right py-2 font-semibold text-gray-600">% Assets</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2 text-gray-800">{h.name}</td>
                <td className="py-2 text-right font-medium">{h.percentage.toFixed(2)}%</td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
      {holdings.length > 0 && (
        <div className="mt-3 text-xs text-gray-400 text-center">
          *Based on latest portfolio disclosure
        </div>
      )}
    </div>
  );
}
