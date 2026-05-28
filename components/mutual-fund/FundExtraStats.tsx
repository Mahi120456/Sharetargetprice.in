interface FundExtraStatsProps {
  fund: {
    fund_manager?: string;
    fund_manager_tenure?: string;
    volatility?: number;
    sharpe_ratio?: number;
    portfolio_turnover?: number;
    asset_allocation?: string;
    investment_objective?: string;
    benchmark?: string;
    holdings_date?: string;
  };
}

export default function FundExtraStats({ fund }: FundExtraStatsProps) {
  const hasAnyData = fund.fund_manager || fund.volatility || fund.sharpe_ratio || fund.asset_allocation || fund.investment_objective;
  if (!hasAnyData) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3">
        Fund Manager & Key Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {fund.fund_manager && (
          <div>
            <span className="text-gray-500 block">Fund Manager</span>
            <span className="font-semibold text-gray-800">{fund.fund_manager}</span>
            {fund.fund_manager_tenure && (
              <span className="text-gray-500 text-xs ml-1">({fund.fund_manager_tenure} yrs)</span>
            )}
          </div>
        )}
        {fund.volatility && (
          <div>
            <span className="text-gray-500 block">Volatility</span>
            <span className="font-semibold text-gray-800">{fund.volatility}</span>
          </div>
        )}
        {fund.sharpe_ratio && (
          <div>
            <span className="text-gray-500 block">Sharpe Ratio</span>
            <span className="font-semibold text-gray-800">{fund.sharpe_ratio}</span>
          </div>
        )}
        {fund.portfolio_turnover && (
          <div>
            <span className="text-gray-500 block">Portfolio Turnover</span>
            <span className="font-semibold text-gray-800">{fund.portfolio_turnover}%</span>
          </div>
        )}
        {fund.benchmark && (
          <div>
            <span className="text-gray-500 block">Benchmark</span>
            <span className="font-semibold text-gray-800">{fund.benchmark}</span>
          </div>
        )}
        {fund.holdings_date && (
          <div>
            <span className="text-gray-500 block">Holdings Date</span>
            <span className="font-semibold text-gray-800">{new Date(fund.holdings_date).toLocaleDateString('en-IN')}</span>
          </div>
        )}
        {fund.asset_allocation && (
          <div className="md:col-span-2">
            <span className="text-gray-500 block">Asset Allocation</span>
            <p className="text-gray-800">{fund.asset_allocation}</p>
          </div>
        )}
        {fund.investment_objective && (
          <div className="md:col-span-2">
            <span className="text-gray-500 block">Investment Objective</span>
            <p className="text-gray-800 text-sm leading-relaxed">{fund.investment_objective}</p>
          </div>
        )}
      </div>
    </div>
  );
}
