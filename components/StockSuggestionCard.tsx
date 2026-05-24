'use client';
import Link from 'next/link';

interface StockSuggestionCardProps {
  stock: {
    slug: string;
    name: string;
    symbol: string;
    current_price: number | null;
  };
  label: string;
}

export default function StockSuggestionCard({ stock, label }: StockSuggestionCardProps) {
  if (!stock) return null;
  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 my-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-orange-600 font-semibold uppercase tracking-wide">{label}</div>
          <Link href={`/stock/${stock.slug}-share-price-target`} className="font-bold text-gray-800 hover:text-orange-600 text-lg">
            {stock.name}
          </Link>
          <div className="text-sm text-gray-500">{stock.symbol}</div>
        </div>
        <div className="text-right">
          {stock.current_price && (
            <div className="text-sm font-medium text-gray-700">₹{stock.current_price.toFixed(2)}</div>
          )}
          <Link href={`/stock/${stock.slug}-share-price-target`} className="inline-block mt-1 bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-600 hover:text-white transition">
            View Target →
          </Link>
        </div>
      </div>
    </div>
  );
}
