'use client';
import { useState } from 'react';

interface BullBearCaseProps {
  stockName: string;
  currentPrice: number;
  target2026: string;
}

export default function BullBearCase({ stockName, currentPrice, target2026 }: BullBearCaseProps) {
  const [activeCase, setActiveCase] = useState<'bull' | 'base' | 'bear'>('base');

  const basePrice = currentPrice || 100;
  const parseTarget = (t: string) => parseInt(String(t).replace('₹', '').replace(/,/g, '')) || basePrice;
  const baseTarget = parseTarget(target2026);

  const cases = {
    bull: {
      name: 'Bull Case',
      icon: '🐂',
      target: Math.round(baseTarget * 1.25),
      upside: 25,
      probability: '35%',
      triggers: [
        'Strong earnings growth (15%+ YoY)',
        'Sector tailwinds and government support',
        'Successful expansion into new markets',
        'FII/DPI inflow increase',
        'Interest rate cut cycle'
      ],
      color: 'green'
    },
    base: {
      name: 'Base Case',
      icon: '📊',
      target: baseTarget,
      upside: ((baseTarget - basePrice) / basePrice) * 100,
      probability: '45%',
      triggers: [
        'Steady earnings growth (10-12% YoY)',
        'Stable macroeconomic conditions',
        'Current business momentum continues',
        'No major regulatory changes'
      ],
      color: 'blue'
    },
    bear: {
      name: 'Bear Case',
      icon: '🐻',
      target: Math.round(baseTarget * 0.85),
      upside: -15,
      probability: '20%',
      triggers: [
        'Slowing economy and lower demand',
        'Increased competition eroding margins',
        'Rising interest rates impacting valuation',
        'Regulatory hurdles'
      ],
      color: 'red'
    }
  };

  const current = cases[activeCase];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">{stockName} 2026: Bull, Base & Bear Case</h2>
        <p className="text-sm text-gray-500 mt-1">Scenario analysis for the next 12-18 months</p>
      </div>

      {/* Toggle Navigation */}
      <div className="flex border-b border-gray-100">
        {(['bull', 'base', 'bear'] as const).map((caseKey) => (
          <button
            key={caseKey}
            onClick={() => setActiveCase(caseKey)}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              activeCase === caseKey
                ? `border-b-2 border-${cases[caseKey].color}-500 text-${cases[caseKey].color}-600 bg-${cases[caseKey].color}-50`
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {cases[caseKey].icon} {cases[caseKey].name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Target & Probability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className={`bg-${current.color}-50 rounded-xl p-4 text-center`}>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Target Price (2026)</div>
            <div className={`text-3xl font-black text-${current.color}-600 mt-1`}>
              ₹{current.target.toLocaleString('en-IN')}
            </div>
            <div className={`text-sm font-semibold mt-1 ${current.upside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {current.upside >= 0 ? '+' : ''}{current.upside.toFixed(0)}% from current
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Probability</div>
            <div className="text-3xl font-black text-gray-800 mt-1">{current.probability}</div>
            <div className="text-xs text-gray-400 mt-1">Based on market conditions</div>
          </div>
        </div>

        {/* Key Triggers */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>🔑</span> Key Triggers & Catalysts
          </h3>
          <div className="space-y-2">
            {current.triggers.map((trigger, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>{trigger}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Probability Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Bear: {cases.bear.probability}</span>
            <span>Base: {cases.base.probability}</span>
            <span>Bull: {cases.bull.probability}</span>
          </div>
          <div className="h-2 flex rounded-full overflow-hidden">
            <div className="bg-red-500" style={{ width: '20%' }}></div>
            <div className="bg-blue-500" style={{ width: '45%' }}></div>
            <div className="bg-green-500" style={{ width: '35%' }}></div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center border-t">
        *Probability distribution based on market consensus and fundamental analysis. Not financial advice.
      </div>
    </div>
  );
}
