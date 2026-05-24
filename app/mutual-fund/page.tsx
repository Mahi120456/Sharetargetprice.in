import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mutual Funds – NAV, Returns & Analysis | Share Target Price",
  description: "Explore top Indian mutual funds by AUM. View latest NAV, returns, expense ratio, AUM, and detailed analysis.",
  keywords: "mutual funds, best mutual funds, NAV, SIP, large cap, mid cap, ELSS, debt funds",
};

async function getMutualFunds() {
  const { data, error } = await supabase
    .from('mutual_funds')
    .select('scheme_name, slug, category, nav, returns_1y, returns_3y, aum')
    .order('aum', { ascending: false });
  return data || [];
}

export default async function MutualFundsPage() {
  const funds = await getMutualFunds();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">📊 Mutual Funds</h1>
        <p className="text-gray-600 mb-8">Browse top Indian mutual funds by AUM, NAV, and returns.</p>

        {funds.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No mutual funds found in database. Please run the seed script.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {funds.map(fund => (
              <Link key={fund.slug} href={`/mutual-fund/${fund.slug}`} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition">
                <h2 className="font-bold text-gray-800 hover:text-orange-600 line-clamp-2">{fund.scheme_name}</h2>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">{fund.category || 'Others'}</span>
                  {fund.nav && <span>NAV: ₹{fund.nav.toFixed(2)}</span>}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div><span className="text-gray-500">1Y</span><br /><span className={`font-semibold ${fund.returns_1y && fund.returns_1y >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fund.returns_1y?.toFixed(2)}%</span></div>
                  <div><span className="text-gray-500">3Y</span><br /><span className={`font-semibold ${fund.returns_3y && fund.returns_3y >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fund.returns_3y?.toFixed(2)}%</span></div>
                  <div><span className="text-gray-500">AUM</span><br /><span className="font-semibold">{fund.aum ? `₹${(fund.aum/1000).toFixed(1)}k Cr` : 'N/A'}</span></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
