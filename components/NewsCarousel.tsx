'use client';
export default function NewsCarousel({ stockName }: { stockName: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-lg mb-4 text-gray-800 tracking-tight">Recent News: {stockName}</h3>
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-gray-800">{stockName} momentum continues ahead of results.</p>
          <span className="text-xs text-gray-400">2 hours ago</span>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-gray-800">Expert view on {stockName} share price targets.</p>
          <span className="text-xs text-gray-400">5 hours ago</span>
        </div>
      </div>
    </div>
  );
}
