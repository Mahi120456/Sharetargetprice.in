'use client';
import { useState, useEffect } from 'react';

export default function StockPriceLive({ symbol }: { symbol: string }) {
  const [data, setData] = useState({ price: '...', change: '0' });

  useEffect(() => {
    async function fetchPrice() {
      const res = await fetch(`/api/stock/live?symbol=${symbol}`);
      const json = await res.json();
      setData(json);
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black">₹{data.price}</span>
      <span className={`text-sm font-bold ${parseFloat(data.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {parseFloat(data.change) >= 0 ? '▲' : '▼'} {data.change}%
      </span>
    </div>
  );
}
