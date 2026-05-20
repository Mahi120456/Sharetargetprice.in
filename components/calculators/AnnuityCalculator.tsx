'use client';
import { useState } from 'react';

export default function AnnuityCalculator() {
  // Use string state to allow empty input
  const [lumpsumStr, setLumpsumStr] = useState('1000000');
  const [rateStr, setRateStr] = useState('7');
  const [yearsStr, setYearsStr] = useState('20');
  const [frequency, setFrequency] = useState('monthly');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const lumpsum = parseFloat(lumpsumStr);
    const rate = parseFloat(rateStr);
    const years = parseFloat(yearsStr);
    if (isNaN(lumpsum) || isNaN(rate) || isNaN(years)) return;

    const r = rate / 100;
    const n = years;
    let payout;
    if (frequency === 'monthly') {
      const monthlyRate = r / 12;
      const months = n * 12;
      payout = lumpsum * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    } else if (frequency === 'quarterly') {
      const quarterlyRate = r / 4;
      const quarters = n * 4;
      payout = lumpsum * (quarterlyRate * Math.pow(1 + quarterlyRate, quarters)) / (Math.pow(1 + quarterlyRate, quarters) - 1);
    } else {
      payout = lumpsum * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    setResult(payout);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-5">
      <h2 className="text-2xl font-bold mb-4">Annuity Calculator</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-medium">Lump Sum Amount (₹)</label>
          <input
            type="text"
            value={lumpsumStr}
            onChange={(e) => setLumpsumStr(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter amount"
          />
        </div>
        <div>
          <label className="block font-medium">Expected Return Rate (%)</label>
          <input
            type="text"
            value={rateStr}
            onChange={(e) => setRateStr(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="e.g., 7"
          />
        </div>
        <div>
          <label className="block font-medium">Period (Years)</label>
          <input
            type="text"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="e.g., 20"
          />
        </div>
        <div>
          <label className="block font-medium">Payment Frequency</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full p-2 border rounded-lg">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <button onClick={calculate} className="bg-orange-500 text-white w-full p-2 rounded-lg font-semibold hover:bg-orange-600 transition">
          Calculate Annuity
        </button>
        {result !== null && !isNaN(result) && (
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="font-bold text-lg">Estimated {frequency} payout: ₹{Math.round(result).toLocaleString('en-IN')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
