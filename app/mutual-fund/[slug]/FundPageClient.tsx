'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Temporary simple version – we'll add full components later
export default function FundPageClient({ fund }: { fund: any }) {
  const router = useRouter();
  const [navData, setNavData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/mutual-fund/live?code=${fund.scheme_code}`)
      .then(res => res.json())
      .then(setNavData)
      .catch(console.error);
  }, [fund.scheme_code]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition-colors bg-white border border-gray-200 hover:border-orange-200 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Fund Header */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{fund.scheme_name}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">{fund.category}</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{fund.riskometer} Risk</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{fund.fund_house}</span>
        </div>
        {navData && (
          <div className="mt-4">
            <div className="text-3xl font-bold">₹{navData.nav.toFixed(2)}</div>
            <div className="text-sm text-gray-500">NAV as on {navData.date}</div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-xs text-gray-500">AUM</div>
            <div className="font-semibold">{fund.aum ? `₹${(fund.aum).toLocaleString()} Cr` : 'N/A'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-xs text-gray-500">Expense Ratio</div>
            <div className="font-semibold">{fund.expense_ratio ? `${fund.expense_ratio}%` : 'N/A'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-xs text-gray-500">Min SIP</div>
            <div className="font-semibold">₹{fund.min_sip_amount || 500}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-xs text-gray-500">3Y Returns</div>
            <div className={`font-semibold ${fund.returns_3y && fund.returns_3y > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fund.returns_3y ? `${fund.returns_3y.toFixed(2)}%` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for article and other sections */}
      <div className="bg-white rounded-2xl shadow-lg border p-6">
        <p className="text-gray-500">Detailed analysis, return calculator, holdings, and FAQ coming soon...</p>
      </div>
    </main>
  );
}
