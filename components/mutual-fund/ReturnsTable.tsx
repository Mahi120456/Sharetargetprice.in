interface ReturnsTableProps {
  fund: {
    returns_1y: number;
    returns_3y: number;
    returns_5y: number;
    returns_since_launch: number;
    benchmark: string;
  };
}

export default function ReturnsTable({ fund }: ReturnsTableProps) {
  const returns = [
    { period: '1 Year', value: fund.returns_1y },
    { period: '3 Years', value: fund.returns_3y },
    { period: '5 Years', value: fund.returns_5y },
    { period: 'Since Launch', value: fund.returns_since_launch },
  ];
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Returns</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-sm border border-gray-100">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left">Period</th><th className="px-6 py-3 text-left">Fund Return (%)</th><th className="px-6 py-3 text-left">Benchmark ({fund.benchmark || 'N/A'}) (%)</th></tr>
          </thead>
          <tbody>
            {returns.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-6 py-4">{r.period}</td>
                <td className={`px-6 py-4 font-medium ${(r.value ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.value != null ? `${r.value}%` : 'N/A'}</td>
                <td className="px-6 py-4 text-gray-500">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
