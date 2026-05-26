'use client';
import { useState } from 'react';

interface SIPCalculatorProps {
  fund: { nav: number; returns_1y?: number };
}

export default function SIPCalculator({ fund }: SIPCalculatorProps) {
  const [amount, setAmount] = useState(5000);
  const [years, setYears] = useState(10);
  const [type, setType] = useState<'sip' | 'lumpsum'>('sip');

  const expectedReturn = fund.returns_1y || 12; // fallback
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = years * 12;

  let maturityValue = 0;
  if (type === 'sip') {
    if (monthlyRate > 0) maturityValue = amount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    else maturityValue = amount * totalMonths;
  } else {
    maturityValue = amount * Math.pow(1 + expectedReturn / 100, years);
  }

  return (
    <div className="my-8 bg-gray-50 p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">SIP / Lumpsum Calculator</h2>
      <div className="flex gap-4 mb-4">
        <button onClick={() => setType('sip')} className={`px-4 py-2 rounded ${type === 'sip' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>SIP</button>
        <button onClick={() => setType('lumpsum')} className={`px-4 py-2 rounded ${type === 'lumpsum' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Lumpsum</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="block text-sm">Monthly SIP / Investment Amount (₹)</label><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm">Time Period (Years)</label><input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full p-2 border rounded" /></div>
      </div>
      <div className="mt-4 p-4 bg-white rounded shadow">
        <p className="text-lg">Estimated Future Value: <strong>₹{maturityValue.toFixed(2)}</strong></p>
        <p className="text-sm text-gray-500">Assuming {expectedReturn}% annual returns (past 1Y)</p>
      </div>
    </div>
  );
}
