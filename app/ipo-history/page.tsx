import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 3600;

export default async function IPOHistoryPage() {
  const { data: ipos } = await supabase
    .from('ipos')
    .select('*')
    .eq('status', 'listed')
    .order('listing_date', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">IPO History Database</h1>
      <p className="text-gray-600 mb-6">Search past IPOs – listing gains, current returns, and performance.</p>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow">
          <thead className="bg-gray-50"><tr>
            <th className="p-3 text-left">Company</th>
            <th>Year</th>
            <th>IPO Price (₹)</th>
            <th>Listing Price (₹)</th>
            <th>Current Price (₹)</th>
            <th>Return Since Listing</th>
          </tr>
          </thead>
          <tbody>
            {ipos?.map(ipo => {
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
                  <td>{ipo.listing_date ? new Date(ipo.listing_date).getFullYear() : '-'}</td>
                  <td>{ipoPrice !== null ? `₹${ipoPrice}` : '-'}</td>
                  <td>{listingPrice !== null ? `₹${listingPrice}` : '-'}</td>
                  <td>{currentPrice !== null ? `₹${currentPrice}` : '-'}</td>
                  <td className={returnPct !== null && returnPct >= 0 ? 'text-green-600' : returnPct !== null && returnPct < 0 ? 'text-red-600' : ''}>
                    {returnPct !== null ? `${returnPct.toFixed(2)}%` : '-'}
                  </td>
                </td>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
