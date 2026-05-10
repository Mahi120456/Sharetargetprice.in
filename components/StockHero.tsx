'use client';
import { useState, useEffect } from 'react';

export default function StockHero({ name, symbol }: { name: string, symbol: string }) {
  const [price, setPrice] = useState('...');

  useEffect(() => {
    fetch(`/api/stock/live?symbol=${symbol}`).then(res => res.json()).then(d => setPrice(d.price));
  }, [symbol]);

  return (
    <div className="bg-white border p-6 md:p-10 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tighter">{name}</h1>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-sm mt-1">NSE: {symbol} • Share Price Target</p>
      </div>
      <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 text-center">
        <div className="text-xs text-green-600 font-bold uppercase">Live Price</div>
        <div className="text-3xl font-black text-green-700 font-mono">₹{price}</div>
      </div>
    </div>
  );
}
