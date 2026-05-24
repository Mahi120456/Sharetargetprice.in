'use client';
import { ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';

export default function FundHero({ fund, navData }: { fund: any; navData: any }) {
  const returns = [
    { label: '1Y', value: fund.returns_1y },
    { label: '3Y', value: fund.returns_3y },
    { label: '5Y', value: fund.returns_5y },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-orange-50 to-white p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{fund.scheme_name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">{fund.category}</span>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{fund.riskometer} Risk</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{fund.fund_house}</span>
            </div>
          </div>
          {navData && (
            <div className="text-right">
              <div className="text-3xl font-bold">₹{navData.nav.toFixed(2)}</div>
              <div className="text-sm text-gray-500">NAV as on {navData.date}</div>
              <div className="text-xs text-gray-400 mt-1">Scheme Code: {fund.scheme_code}</div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50">
        {returns.map(r => (
          <div key={r.label} className="text-center">
            <div className="text-xs text-gray-500">{r.label} Returns</div>
            <div className={`text-xl font-bold ${r.value && r.value > 0 ? 'text-green-600' : r.value && r.value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {r.value ? `${r.value.toFixed(2)}%` : 'N/A'}
            </div>
          </div>
        ))}
        <div className="text-center">
          <div className="text-xs text-gray-500">AUM</div>
          <div className="text-xl font-bold text-gray-800">{fund.aum ? `₹${(fund.aum/1000).toFixed(1)}k Cr` : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}
