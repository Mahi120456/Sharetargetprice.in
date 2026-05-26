// components/mutual-fund/FundHero.tsx
interface FundHeroProps {
  fund: {
    scheme_name: string;
    fund_house: string;
    category: string;
    nav: number;
    aum: number;
    riskometer: string;
    returns_1y: number;
    seo_title?: string;
  };
}

export default function FundHero({ fund }: FundHeroProps) {
  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-green-100 text-green-800',
      'Moderate': 'bg-blue-100 text-blue-800',
      'Moderately High': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Very High': 'bg-red-100 text-red-800',
    };
    return colors[risk] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {fund.scheme_name}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">
              {fund.fund_house}
            </span>
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">
              {fund.category}
            </span>
            <span className={`px-3 py-1 rounded-full shadow-sm font-medium ${getRiskBadge(fund.riskometer)}`}>
              {fund.riskometer} Risk
            </span>
          </div>
        </div>
        <div className="text-right bg-white p-4 rounded-xl shadow-sm min-w-[180px]">
          <div className="text-sm text-gray-500">Current NAV</div>
          <div className="text-2xl font-bold text-blue-600">₹{fund.nav?.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">as of {new Date().toLocaleDateString('en-IN')}</div>
        </div>
      </div>
    </div>
  );
}
