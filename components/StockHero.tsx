'use client';
import { useState, useEffect } from 'react';

export default function StockHero({ name, symbol }: { name: string, symbol: string }) {
  const [live, setLive] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/stock/live?symbol=${symbol}`).then(res => res.json()).then(setLive);
  }, [symbol]);

  return (
    <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900">{name}</h1>
        <p className="text-gray-500 font-medium">Stock Analysis & Price Prediction</p>
      </div>
      <div className="text-right mt-4 md:mt-0">
        <div className="text-5xl font-black text-blue-600">₹{live?.price || '...'}</div>
        <div className={`font-bold ${Number(live?.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {Number(live?.change) >= 0 ? '+' : ''}{live?.change} Today
        </div>
      </div>
    </div>
  );
}
