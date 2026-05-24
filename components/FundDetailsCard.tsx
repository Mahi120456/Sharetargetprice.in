'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, User, Building2, FileText, Clock } from 'lucide-react';

interface FundManager {
  name: string;
  from_date?: string;
  to_date?: string;
}

interface FundDetailsCardProps {
  expenseRatio?: number;
  exitLoad?: string;
  stampDuty?: string;
  taxImplication?: string;
  fundManagers?: FundManager[];
  fundHouse?: string;
  launchDate?: string;
  benchmark?: string;
}

export default function FundDetailsCard({
  expenseRatio,
  exitLoad = 'Exit load of 1%, if redeemed within 15 days.',
  stampDuty = '0.005% (from July 1st, 2020)',
  taxImplication = 'If redeemed within 2 years: taxed as per Income Tax slab. After 2 years: 12.5% LTCG tax.',
  fundManagers = [],
  fundHouse,
  launchDate,
  benchmark,
}: FundDetailsCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center"
      >
        <h2 className="text-xl font-bold text-gray-900">💼 Fund Details & Charges</h2>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-3 text-sm">
          {expenseRatio && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Expense Ratio</span>
              <span className="font-medium">{expenseRatio}% (inclusive of GST)</span>
            </div>
          )}
          {exitLoad && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Exit Load</span>
              <span className="font-medium">{exitLoad}</span>
            </div>
          )}
          {stampDuty && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Stamp Duty</span>
              <span className="font-medium">{stampDuty}</span>
            </div>
          )}
          {taxImplication && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tax Implications</span>
              <span className="font-medium text-right max-w-[60%]">{taxImplication}</span>
            </div>
          )}
          {fundManagers.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <div className="text-gray-600 mb-1">Fund Managers</div>
              {fundManagers.map((m, idx) => (
                <div key={idx} className="flex justify-between text-sm mt-1">
                  <span>{m.name}</span>
                  <span className="text-gray-500">{m.from_date} – {m.to_date || 'Present'}</span>
                </div>
              ))}
            </div>
          )}
          {fundHouse && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Fund House</span>
              <span className="font-medium">{fundHouse}</span>
            </div>
          )}
          {launchDate && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Launch Date</span>
              <span className="font-medium">{new Date(launchDate).toLocaleDateString('en-IN')}</span>
            </div>
          )}
          {benchmark && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Benchmark</span>
              <span className="font-medium">{benchmark}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
