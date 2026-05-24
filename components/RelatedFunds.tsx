'use client';
import Link from 'next/link';

interface RelatedFund {
  slug: string;
  scheme_name: string;
  category: string;
  returns_3y?: number | null;
  nav?: number | null;
}

interface RelatedFundsProps {
  funds: RelatedFund[];
  currentFundName: string;
  category: string;
}

export default function RelatedFunds({ funds, currentFundName, category }: RelatedFundsProps) {
  if (!funds || funds.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        🔗 Similar Funds in {category}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {funds.slice(0, 6).map(fund => (
          <Link
            key={fund.slug}
            href={`/mutual-fund/${fund.slug}`}
            className="group block p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition border border-gray-100"
          >
            <div className="font-semibold text-gray-800 group-hover:text-orange-600 text-sm line-clamp-2">
              {fund.scheme_name}
            </div>
            <div className="text-xs text-gray-400 mt-1">{fund.category}</div>
            <div className="flex justify-between items-center mt-2">
              {fund.nav && <span className="text-xs text-gray-600">NAV: ₹{fund.nav.toFixed(2)}</span>}
              {fund.returns_3y && (
                <span className={`text-xs font-medium ${fund.returns_3y > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  3Y: {fund.returns_3y.toFixed(1)}%
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
