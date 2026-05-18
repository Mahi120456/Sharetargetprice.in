'use client';

interface TechnicalSectionProps {
  rsi?: number;
  macd?: number;
}

export default function TechnicalSection({ rsi, macd }: TechnicalSectionProps) {
  const getRSIVerdict = (value: number) => {
    if (value > 70) return { text: 'Overbought', color: 'bg-red-100 text-red-600' };
    if (value < 30) return { text: 'Oversold', color: 'bg-green-100 text-green-600' };
    return { text: 'Neutral', color: 'bg-gray-100 text-gray-600' };
  };

  const getMACDVerdict = (value: number) => {
    if (value > 0) return { text: 'Bullish', color: 'bg-green-100 text-green-600' };
    if (value < 0) return { text: 'Bearish', color: 'bg-red-100 text-red-600' };
    return { text: 'Neutral', color: 'bg-gray-100 text-gray-600' };
  };

  const rsiVerdict = rsi ? getRSIVerdict(rsi) : { text: 'N/A', color: 'bg-gray-100 text-gray-600' };
  const macdVerdict = macd ? getMACDVerdict(macd) : { text: 'N/A', color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Technical Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RSI */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">RSI (14)</h3>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-2xl font-bold">{rsi ? rsi.toFixed(2) : '—'}</p>
              <span className={`text-xs px-3 py-1 rounded-full ${rsiVerdict.color}`}>
                {rsiVerdict.text}
              </span>
            </div>
          </div>
        </div>

        {/* MACD */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">MACD</h3>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-2xl font-bold">{macd ? macd.toFixed(2) : '—'}</p>
              <span className={`text-xs px-3 py-1 rounded-full ${macdVerdict.color}`}>
                {macdVerdict.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Technical data powered by FMP • Educational purpose only
      </p>
    </div>
  );
}
