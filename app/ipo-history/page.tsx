import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';

export const revalidate = 3600;

export default async function IPOHistoryPage() {
  const { data: ipos } = await supabase
    .from('ipos')
    .select('*')
    .eq('status', 'listed')
    .order('listing_date', { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/ipo" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to IPO Dashboard
        </Link>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm mb-3">
            <Database className="w-4 h-4" /> Complete Database
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IPO History Database</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Search past IPOs – listing gains, current returns, and performance.</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6 flex justify-between items-center">
          <div><span className="text-gray-500">Total IPOs in database:</span> <span className="font-bold text-orange-600 text-xl">{ipos?.length || 0}</span></div>
          <div className="text-sm text-gray-400">Data updated: {new Date().toLocaleDateString()}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Company</th>
                  <th>IPO Year</th>
                  <th>IPO Price (₹)</th>
                  <th>Listing Price (₹)</th>
                  <th>Current Price (₹)</th>
                  <th>Return Since Listing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ipos?.length ? ipos.map(ipo => {
                  const ipoPrice = ipo.price_band ? parseInt(ipo.price_band.split('-')[1]) : null;
                  const listingPrice = ipo.listing_price;
                  const currentPrice = ipo.current_price;
                  let returnPct: number | null = null;
                  if (listingPrice && currentPrice) {
                    returnPct = ((currentPrice - listingPrice) / listingPrice) * 100;
                  }
                  return (
                    <tr key={ipo.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-medium"><Link href={`/ipo/${ipo.slug}`} className="hover:text-orange-600">{ipo.company_name}</Link></td>
                      <td>{ipo.listing_date ? new Date(ipo.listing_date).getFullYear() : '-'}</td>
                      <td>{ipoPrice ? `₹${ipoPrice}` : '-'}</td>
                      <td>{listingPrice ? `₹${listingPrice}` : '-'}</td>
                      <td>{currentPrice ? `₹${currentPrice}` : '-'}</td>
                      <td className={returnPct !== null && returnPct >= 0 ? 'text-green-600 font-semibold' : returnPct !== null && returnPct < 0 ? 'text-red-600' : ''}>
                        {returnPct !== null ? `${returnPct.toFixed(2)}%` : '-'}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No IPO history found. Add IPOs via admin panel.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">* Past performance does not guarantee future results. Data for educational purposes only.</p>
      </div>
    </div>
  );
}
