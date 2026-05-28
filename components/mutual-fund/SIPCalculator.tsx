'use client';
import { useState } from 'react';

interface SIPCalculatorProps {
  fund: { nav: number; returns_1y?: number; returns_3y?: number; returns_5y?: number };
}

export default function SIPCalculator({ fund }: SIPCalculatorProps) {
  const [amount, setAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [holdYears, setHoldYears] = useState(20);
  const [stepUp, setStepUp] = useState(10);
  const [returnScenario, setReturnScenario] = useState<'conservative' | 'moderate' | 'optimistic'>('moderate');

  const baseReturn = fund.returns_3y || fund.returns_5y || fund.returns_1y || 12;
  const scenarioReturns = {
    conservative: baseReturn * 0.7,
    moderate: baseReturn,
    optimistic: baseReturn * 1.3,
  };
  const annualReturn = scenarioReturns[returnScenario];

  // Calculate SIP with step-up during investment phase
  let corpusAtEndOfSip = 0;
  let totalInvested = 0;
  let yearlyInvestment = amount * 12;
  for (let year = 1; year <= sipYears; year++) {
    totalInvested += yearlyInvestment;
    corpusAtEndOfSip = (corpusAtEndOfSip + yearlyInvestment) * (1 + annualReturn / 100);
    yearlyInvestment = yearlyInvestment * (1 + stepUp / 100);
  }

  // Now hold for 'holdYears' without additional investment
  let maturityValue = corpusAtEndOfSip * Math.pow(1 + annualReturn / 100, holdYears);
  const totalReturns = maturityValue - totalInvested;
  const investedPercentage = (totalInvested / maturityValue) * 100;
  const gainsPercentage = 100 - investedPercentage;

  // For Lumpsum mode (simpler, no step-up)
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const lumpsumMaturity = lumpsumAmount * Math.pow(1 + annualReturn / 100, sipYears + holdYears);
  const lumpsumReturns = lumpsumMaturity - lumpsumAmount;

  const isSip = true; // we'll let user choose via separate toggle? To keep UI clean, we'll keep the original toggle but add new fields. Actually we need both modes. Let's reuse the existing type state.

  const [type, setType] = useState<'sip' | 'lumpsum'>('sip');

  // Recompute based on type
  let finalMaturity = 0;
  let finalInvested = 0;
  let finalReturns = 0;
  if (type === 'sip') {
    finalMaturity = maturityValue;
    finalInvested = totalInvested;
    finalReturns = totalReturns;
  } else {
    finalMaturity = lumpsumMaturity;
    finalInvested = lumpsumAmount;
    finalReturns = lumpsumReturns;
  }

  return (
    <div className="my-8 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">SIP / Lumpsum Calculator</h2>
      
      {/* Investment Type Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setType('sip')}
          className={`px-5 py-2 rounded-full font-medium transition-all ${
            type === 'sip' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📈 SIP
        </button>
        <button
          onClick={() => setType('lumpsum')}
          className={`px-5 py-2 rounded-full font-medium transition-all ${
            type === 'lumpsum' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          💰 Lumpsum
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {type === 'sip' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly SIP Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIP Period (Years)</label>
                <input
                  type="number"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hold Period After SIP (Years)</label>
                <input
                  type="number"
                  value={holdYears}
                  onChange={(e) => setHoldYears(Number(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Step-Up (%)</label>
                <input
                  type="number"
                  value={stepUp}
                  onChange={(e) => setStepUp(Number(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lumpsum Investment (₹)</label>
                <input
                  type="number"
                  value={lumpsumAmount}
                  onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Period (Years)</label>
                <input
                  type="number"
                  value={sipYears + holdYears}
                  onChange={(e) => {
                    // Distribute? For simplicity, let's set total period = sipYears+holdYears
                    const total = Number(e.target.value);
                    if (total >= 0) {
                      // Adjust both? We'll just set sipYears = total and holdYears=0 for lumpsum
                      setSipYears(total);
                      setHoldYears(0);
                    }
                  }}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-400 mt-1">(SIP period + hold period combined)</p>
              </div>
            </>
          )}

          {/* Return Scenario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Scenario</label>
            <div className="flex gap-2">
              <button
                onClick={() => setReturnScenario('conservative')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                  returnScenario === 'conservative' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                🛡️ Conservative<br/>{scenarioReturns.conservative.toFixed(1)}%
              </button>
              <button
                onClick={() => setReturnScenario('moderate')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                  returnScenario === 'moderate' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                ⚖️ Moderate<br/>{scenarioReturns.moderate.toFixed(1)}%
              </button>
              <button
                onClick={() => setReturnScenario('optimistic')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                  returnScenario === 'optimistic' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                🚀 Optimistic<br/>{scenarioReturns.optimistic.toFixed(1)}%
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Based on fund's {fund.returns_3y ? '3Y' : fund.returns_5y ? '5Y' : '1Y'} return of {baseReturn.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Right: Pie Chart + Key Numbers */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="white" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f97316"
                strokeWidth="10"
                strokeDasharray={`${(gainsPercentage / 100) * 283} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                className="transition-all duration-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray={`${(investedPercentage / 100) * 283} 283`}
                strokeDashoffset={`${- (gainsPercentage / 100) * 283}`}
                transform="rotate(-90 50 50)"
                className="transition-all duration-700"
              />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#374151">
                ₹{(finalMaturity / 100000).toFixed(1)}L
              </text>
            </svg>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span>Invested: ₹{(finalInvested / 1000).toFixed(0)}k</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span>Gains: ₹{(finalReturns / 1000).toFixed(0)}k</span></div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-8 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Total Invested</p>
            <p className="text-xl font-bold text-gray-800">₹{finalInvested.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Returns</p>
            <p className="text-xl font-bold text-green-600">+ ₹{finalReturns.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Maturity Value</p>
            <p className="text-2xl font-bold text-orange-600">₹{finalMaturity.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-gray-500">
          {type === 'sip' ? (
            <>SIP of ₹{amount} for {sipYears} years (stepping up {stepUp}% annually), then held for {holdYears} years at {annualReturn.toFixed(1)}% p.a.</>
          ) : (
            <>Lumpsum of ₹{lumpsumAmount} for {sipYears + holdYears} years at {annualReturn.toFixed(1)}% p.a.</>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          *Projected returns are for illustration only. Past performance does not guarantee future returns.
        </p>
      </div>
    </div>
  );
}
