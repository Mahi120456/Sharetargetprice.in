'use client';
import { useState, useEffect } from 'react';

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const [total, setTotal] = useState<number | null>(null);
  const [invested, setInvested] = useState<number | null>(null);
  const [returns, setReturns] = useState<number | null>(null);

  useEffect(() => {
    const months = years * 12;
    const r = rate / 12 / 100;
    const investedAmt = monthly * months;
    const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    setTotal(Math.round(fv));
    setInvested(investedAmt);
    setReturns(Math.round(fv - investedAmt));
  }, [monthly, years, rate]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-5">
      <h2 className="text-2xl font-bold mb-4">SIP Calculator</h2>
      <div className="space-y-3">
        <div>
          <label className="block font-medium">Monthly Investment (₹)</label>
          <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block font-medium">Time Period (Years)</label>
          <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block font-medium">Expected Return (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
        </div>
        {total && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div>Invested: ₹{invested?.toLocaleString('en-IN')}</div>
            <div>Returns: ₹{returns?.toLocaleString('en-IN')}</div>
            <div className="font-bold text-lg">Total: ₹{total.toLocaleString('en-IN')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
