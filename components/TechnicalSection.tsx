'use client';

interface TechnicalSectionProps {
  rsi?: number | null;
  macd?: number | null;
  beta?: number | null;
}

export default function TechnicalSection({ rsi, macd, beta }: TechnicalSectionProps) {
  const getRSIVerdict = (val: number) => {
    if (val >= 70) return { text: 'Overbought', color: 'text-red-600' };
    if (val <= 30) return { text: 'Oversold', color: 'text-green-600' };
    return { text: 'Neutral', color: 'text-gray-600' };
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Indicators</h2>
      <div className="grid grid-cols-2 gap-4">
        {rsi !== undefined && rsi !== null && (
          <div>
            <span className="text-gray-500">RSI (14)</span>
            <div className="text-2xl font-bold">{rsi.toFixed(2)}</div>
            <div className={getRSIVerdict(rsi).color}>{getRSIVerdict(rsi).text}</div>
          </div>
        )}
        {macd !== undefined && macd !== null && (
          <div>
            <span className="text-gray-500">MACD</span>
            <div className="text-2xl font-bold">{macd.toFixed(2)}</div>
            <div className={macd > 0 ? 'text-green-600' : 'text-red-600'}>
              {macd > 0 ? 'Bullish' : 'Bearish'}
            </div>
          </div>
        )}
        {beta !== undefined && beta !== null && (
          <div>
            <span className="text-gray-500">Beta</span>
            <div className="text-2xl font-bold">{beta.toFixed(2)}</div>
            <div>{beta > 1 ? 'Volatile like market' : 'Less volatile'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
