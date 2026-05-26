interface RiskometerProps {
  fund: { riskometer: string; volatility?: number; sharpe_ratio?: number };
}

export default function Riskometer({ fund }: RiskometerProps) {
  const riskLevels = ['Low', 'Moderate', 'Moderately High', 'High', 'Very High'];
  const level = riskLevels.indexOf(fund.riskometer);
  const width = level >= 0 ? ((level+1) / riskLevels.length) * 100 : 0;
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-2">Riskometer</h2>
      <div className="bg-gray-200 h-4 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: `${width}%` }}></div></div>
      <div className="flex justify-between text-sm mt-1"><span>Low</span><span>Moderate</span><span>High</span><span>Very High</span></div>
      <p className="mt-2">Risk Level: <strong>{fund.riskometer}</strong></p>
      {(fund.volatility || fund.sharpe_ratio) && <p className="text-sm text-gray-600 mt-1">Volatility: {fund.volatility} | Sharpe Ratio: {fund.sharpe_ratio}</p>}
    </div>
  );
}
