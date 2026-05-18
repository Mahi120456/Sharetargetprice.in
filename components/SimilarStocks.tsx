'use client';
import Link from 'next/link';

interface SimilarStocksProps {
  similarStocks: string[];
}

export default function SimilarStocks({ similarStocks }: SimilarStocksProps) {
  if (!similarStocks || similarStocks.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Stocks</h2>
      <div className="grid grid-cols-2 gap-3">
        {similarStocks.map((sym) => (
          <Link
            key={sym}
            href={`/stock/${sym.toLowerCase()}-share-price-target`}
            className="p-2 bg-gray-50 rounded-lg hover:bg-orange-50 text-center"
          >
            {sym}
          </Link>
        ))}
      </div>
    </div>
  );
}
