'use client';
import { useState } from 'react';

interface ComparisonSIPCalculatorProps {
  fund1: {
    scheme_name: string;
    returns_3y?: number | null;
  };
  fund2: {
    scheme_name: string;
    returns_3y?: number | null;
  };
}

export default function ComparisonSIPCalculator({ fund1, fund2 }: ComparisonSIPCalculatorProps) {
  const [amount, setAmount] = useState(5000);
  const [years, setYears] = useState(10);

  // Fallback return if historical data missing
  const return1 = fund1.returns_3y ?? 12;
  const return2 = fund2.returns_3y ?? 12;

  const calculateMaturity = (rate: number) => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate > 0) {
      return amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    }
    return amount * months;
  };

  const maturity1 = calculateMaturity(return1);
  const maturity2 = calculateMaturity(return2);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">SIP Calculator – Compare Growth Potential</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly SIP Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Period (Years)</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-gray-800">{fund1.scheme_name.split(' - ')[0]}</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">₹{maturity1.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">@{return1.toFixed(1)}% annual return (3Y)</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-gray-800">{fund2.scheme_name.split(' - ')[0]}</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">₹{maturity2.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">@{return2.toFixed(1)}% annual return (3Y)</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-4">
        *Projected returns are illustrative based on historical 3‑year returns. Past performance does not guarantee future returns.
      </p>
    </div>
  );
}
