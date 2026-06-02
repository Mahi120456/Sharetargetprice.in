import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Calendar, TrendingUp, History, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export default async function IPODashboard() {
  const { data: upcoming } = await supabase
    .from('ipos')
    .select('*')
    .eq('status', 'upcoming')
    .order('open_date', { ascending: true });

  const { data: current } = await supabase
    .from('ipos')
    .select('*')
    .eq('status', 'current')
    .order('close_date', { ascending: true });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recent } = await supabase
    .from('ipos')
    .select('*')
    .eq('status', 'listed')
    .gte('listing_date', thirtyDaysAgo.toISOString())
    .order('listing_date', { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with history link */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IPO Dashboard</h1>
            <p className="text-gray-600 mt-1">Upcoming, current & recently listed IPOs – GMP, subscription, listing gain</p>
          </div>
          <Link href="/ipo-history" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition shadow-md">
            <History className="w-4 h-4" /> View Full History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Upcoming IPOs */}
        <section className="mb-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-3 border-b border-orange-100">
            <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-600" /> Upcoming IPOs</h2>
          </div>
          <div className="overflow-x-auto p-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr><th className="p-3 text-left">Company</th><th>Open Date</th><th>Close Date</th><th>Price Band</th><th>Lot Size</th><th>GMP</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {upcoming?.length ? upcoming.map(ipo => (
                  <tr key={ipo.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium"><Link href={`/ipo/${ipo.slug}`} className="hover:text-orange-600">{ipo.company_name}</Link></td>
                    <td className="text-gray-600">{ipo.open_date ? new Date(ipo.open_date).toLocaleDateString() : '-'}</td>
                    <td className="text-gray-600">{ipo.close_date ? new Date(ipo.close_date).toLocaleDateString() : '-'}</td>
                    <td className="font-mono">{ipo.price_band || '-'}</td>
                    <td>{ipo.lot_size || '-'}</td>
                    <td className="font-semibold text-green-600">{ipo.gmp ? `₹${ipo.gmp}` : '-'}</td>
                    <td><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${ipo.analyst_rating === 'Apply' ? 'bg-green-100 text-green-800' : ipo.analyst_rating === 'Avoid' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>{ipo.analyst_rating || '-'}</span></td>
                  </tr>
                )) : <tr><td colSpan={7} className="text-center py-8 text-gray-400">No upcoming IPOs</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Current IPOs - Cards */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-600" /> Current IPOs (Open for Subscription)</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {current?.length ? current.map(ipo => (
              <Link key={ipo.id} href={`/ipo/${ipo.slug}`} className="group bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-all hover:-translate-y-1">
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-600">{ipo.company_name}</h3>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div><span className="text-gray-500">Price Band:</span> {ipo.price_band}</div>
                  <div><span className="text-gray-500">Lot Size:</span> {ipo.lot_size}</div>
                  <div><span className="text-gray-500">GMP:</span> <span className="font-semibold text-green-600">₹{ipo.gmp || '-'}</span></div>
                  <div><span className="text-gray-500">Subscription:</span> {ipo.subscription_total ? `${ipo.subscription_total}x` : '-'}</div>
                </div>
              </Link>
            )) : <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">No current IPOs</div>}
          </div>
        </section>

        {/* Recently Listed (Last 30 days) */}
        <section className="mb-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 border-b border-emerald-100">
            <h2 className="text-xl font-bold flex items-center gap-2">📊 Recently Listed IPOs (Last 30 Days)</h2>
          </div>
          <div className="overflow-x-auto p-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="p-3">Company</th><th>Listing Date</th><th>IPO Price</th><th>Listing Price</th><th>Current Price</th><th>Return</th></tr></thead>
              <tbody>
                {recent?.length ? recent.map(ipo => {
                  const ipoPrice = ipo.price_band ? parseInt(ipo.price_band.split('-')[1]) : null;
                  const listingPrice = ipo.listing_price;
                  const currentPrice = ipo.current_price;
                  let returnPct = null;
                  if (listingPrice && currentPrice) returnPct = ((currentPrice - listingPrice) / listingPrice * 100).toFixed(2);
                  return (
                    <tr key={ipo.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium"><Link href={`/ipo/${ipo.slug}`} className="hover:text-orange-600">{ipo.company_name}</Link></td>
                      <td>{ipo.listing_date ? new Date(ipo.listing_date).toLocaleDateString() : '-'}</td>
                      <td>{ipoPrice ? `₹${ipoPrice}` : '-'}</td>
                      <td>{listingPrice ? `₹${listingPrice}` : '-'}</td>
                      <td>{currentPrice ? `₹${currentPrice}` : '-'}</td>
                      <td className={returnPct && returnPct >= 0 ? 'text-green-600 font-semibold' : returnPct && returnPct < 0 ? 'text-red-600' : ''}>{returnPct ? `${returnPct}%` : '-'}</td>
                    </tr>
                  );
                }) : <tr><td colSpan={6} className="text-center py-8 text-gray-400">No recent IPOs</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
