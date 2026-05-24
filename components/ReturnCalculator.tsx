'use client';
import { useState } from 'react';

interface ReturnCalculatorProps {
  fundName: string;
  nav?: number;
}

export default function ReturnCalculator({ fundName, nav }: ReturnCalculatorProps) {
  const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip');
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [lumpsumAmount, setLumpsumAmount] = useState(10000);
  const [years, setYears] = useState(3);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [result, setResult] = useState<{ invested: number; final: number; returns: number } | null>(null);

  const calculate = () => {
    if (mode === 'sip') {
      const months = years * 12;
      const monthlyRate = expectedReturn / 12 / 100;
      const invested = monthlyAmount * months;
      const final = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      setResult({
        invested,
        final: Math.round(final),
        returns: Math.round(final - invested),
      });
    } else {
      const invested = lumpsumAmount;
      const rate = expectedReturn / 100;
      const final = lumpsumAmount * Math.pow(1 + rate, years);
      setResult({
        invested,
        final: Math.round(final),
        returns: Math.round(final - invested),
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Return Calculator</h2>
      
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setMode('sip')}
          className={`flex-1 py-2 rounded-lg font-medium transition ${mode === 'sip' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Monthly SIP
        </button>
        <button
          onClick={() => setMode('lumpsum')}
          className={`flex-1 py-2 rounded-lg font-medium transition ${mode === 'lumpsum' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          One-time
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {mode === 'sip' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Investment (₹)</label>
            <input
              type="number"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (₹)</label>
            <input
              type="number"
              value={lumpsumAmount}
              onChange={(e) => setLumpsumAmount(Number(e.target.value))}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Period (Years)</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full p-2 border border-gray-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return (%)</label>
          <input
            type="number"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className="w-full p-2 border border-gray-200 rounded-lg"
          />
        </div>
        <button
          onClick={calculate}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Calculate
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-5 bg-green-50 p-4 rounded-xl">
          <div className="flex justify-between items-center border-b border-green-100 pb-2 mb-2">
            <span className="text-gray-600">Invested Amount</span>
            <span className="font-semibold">₹{result.invested.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center border-b border-green-100 pb-2 mb-2">
            <span className="text-gray-600">Estimated Returns</span>
            <span className="font-semibold text-green-700">+₹{result.returns.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-bold text-gray-800">Total Value</span>
            <span className="font-bold text-orange-600 text-lg">₹{result.final.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
