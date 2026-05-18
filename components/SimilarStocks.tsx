'use client';

interface SimilarStocksProps {
  similarStocks: any[];
}

export default function SimilarStocks({ similarStocks }: SimilarStocksProps) {
  if (!similarStocks || similarStocks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Similar Stocks</h2>

      <div className="space-y-3">
        {similarStocks.slice(0, 6).map((stock, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div>
              <p className="font-semibold text-gray-900">{stock.name}</p>
              <p className="text-xs text-gray-500">{stock.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">₹{stock.current_price}</p>
              {stock.change_percent && (
                <span className={`text-xs ${stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
