'use client';

interface ShareholdingSectionProps {
  shareholding: any[];
}

export default function ShareholdingSection({ shareholding }: ShareholdingSectionProps) {
  if (!shareholding || shareholding.length === 0) return null;
  // Group by holder type? For simplicity, show table
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Shareholding Pattern</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Holder</th>
              <th className="text-right py-2">Shares Held</th>
              <th className="text-right py-2">%</th>
            </tr>
          </thead>
          <tbody>
            {shareholding.slice(0, 10).map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{item.holder || item.name}</td>
                <td className="text-right py-2">{(item.shares || 0).toLocaleString()}</td>
                <td className="text-right py-2">{((item.percentage || 0) * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
