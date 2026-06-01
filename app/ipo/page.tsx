import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Calendar, TrendingUp } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">IPO Dashboard</h1>
      <p className="text-gray-600 mb-8">Upcoming, current & recently listed IPOs – GMP, subscription, listing gain</p>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5"/> Upcoming IPOs</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Company</th>
                <th>Open Date</th>
                <th>Close Date</th>
                <th>Price Band</th>
                <th>Lot Size</th>
                <th>GMP</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {upcoming?.map((ipo) => (
                <tr key={ipo.id} className="border-t">
                  <td className="p-3"><Link href={`/ipo/${ipo.slug}`} className="font-medium hover:text-orange-600">{ipo.company_name}</Link></td>
                  <td>{ipo.open_date ? new Date(ipo.open_date).toLocaleDateString() : '-'}</td>
                  <td>{ipo.close_date ? new Date(ipo.close_date).toLocaleDateString() : '-'}</td>
                  <td>{ipo.price_band || '-'}</td>
                  <td>{ipo.lot_size || '-'}</td>
                  <td className="font-medium text-green-600">{ipo.gmp ? `₹${ipo.gmp}` : '-'}</td>
                  <td><span className={`px-2 py-1 rounded-full text-xs ${ipo.analyst_rating === 'Apply' ? 'bg-green-100 text-green-800' : ipo.analyst_rating === 'Avoid' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{ipo.analyst_rating || '-'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Current IPOs (Open)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {current?.map((ipo) => (
            <Link key={ipo.id} href={`/ipo/${ipo.slug}`} className="bg-white rounded-xl p-4 shadow hover:shadow-md">
              <h3 className="font-bold text-lg">{ipo.company_name}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>Price: {ipo.price_band}</div>
                <div>Lot: {ipo.lot_size}</div>
                <div>GMP: ₹{ipo.gmp}</div>
                <div>Subscription: {ipo.subscription_total}x</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Recently Listed IPOs</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Company</th>
                <th>Listing Date</th>
                <th>IPO Price</th>
                <th>Listing Price</th>
                <th>Current Price</th>
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              {recent?.map((ipo) => {
                const ipoPrice = ipo.price_band ? parseInt(ipo.price_band.split('-')[1]) : null;
                const listingPrice = ipo.listing_price;
                const currentPrice = ipo.current_price;
                let returnPct: number | null = null;
                if (listingPrice && currentPrice) {
                  returnPct = ((currentPrice - listingPrice) / listingPrice) * 100;
                }
                return (
                  <tr key={ipo.id} className="border-t">
                    <td className="p-3"><Link href={`/ipo/${ipo.slug}`} className="hover:text-orange-600">{ipo.company_name}</Link></td>
                    <td>{ipo.listing_date ? new Date(ipo.listing_date).toLocaleDateString() : '-'}</td>
                    <td>{ipoPrice !== null ? `₹${ipoPrice}` : '-'}</td>
                    <td>{listingPrice !== null ? `₹${listingPrice}` : '-'}</td>
                    <td>{currentPrice !== null ? `₹${currentPrice}` : '-'}</td>
                    <td className={returnPct !== null && returnPct >= 0 ? 'text-green-600' : returnPct !== null && returnPct < 0 ? 'text-red-600' : ''}>
                      {returnPct !== null ? `${returnPct.toFixed(2)}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
