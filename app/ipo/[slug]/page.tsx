import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export async function generateStaticParams() {
  const { data } = await supabase.from('ipos').select('slug');
  return data?.map(ipo => ({ slug: ipo.slug })) || [];
}

async function getIPO(slug: string) {
  const { data, error } = await supabase.from('ipos').select('*').eq('slug', slug).single();
  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const ipo = await getIPO(params.slug);
  if (!ipo) return { title: 'IPO Not Found' };
  return {
    title: `${ipo.company_name} IPO – GMP, Price Band, Subscription, Apply or Avoid?`,
    description: `Complete analysis of ${ipo.company_name} IPO. Check open/close dates, price band, lot size, GMP, subscription, listing gain prediction.`,
  };
}

export default async function IPOPage({ params }: { params: { slug: string } }) {
  const ipo = await getIPO(params.slug);
  if (!ipo) notFound();

  const ipoPrice = ipo.price_band ? parseInt(ipo.price_band.split('-')[1]) : null;
  const listingGain = (ipo.listing_price && ipoPrice) ? ((ipo.listing_price - ipoPrice) / ipoPrice * 100).toFixed(2) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-6">
        <ArrowLeft className="w-4 h-4"/> Back to IPO Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-2">{ipo.company_name} IPO</h1>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* IPO Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">IPO Details</h2>
          <dl className="space-y-2">
            <div><dt className="inline font-medium">Open Date:</dt> <dd className="inline ml-2">{ipo.open_date ? new Date(ipo.open_date).toLocaleDateString() : '-'}</dd></div>
            <div><dt className="inline font-medium">Close Date:</dt> <dd className="inline ml-2">{ipo.close_date ? new Date(ipo.close_date).toLocaleDateString() : '-'}</dd></div>
            <div><dt className="inline font-medium">Listing Date:</dt> <dd className="inline ml-2">{ipo.listing_date ? new Date(ipo.listing_date).toLocaleDateString() : '-'}</dd></div>
            <div><dt className="inline font-medium">Price Band:</dt> <dd className="inline ml-2">{ipo.price_band || '-'}</dd></div>
            <div><dt className="inline font-medium">Issue Size:</dt> <dd className="inline ml-2">{ipo.issue_size ? `₹${ipo.issue_size} Cr` : '-'}</dd></div>
            <div><dt className="inline font-medium">Lot Size:</dt> <dd className="inline ml-2">{ipo.lot_size || '-'}</dd></div>
          </dl>
        </div>

        {/* GMP & Subscription */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">GMP & Subscription</h2>
          <div>GMP: <span className="font-bold text-green-600">₹{ipo.gmp || '-'}</span></div>
          <div>Expected Listing Gain: {listingGain ? `${listingGain}%` : (ipo.gmp ? `₹${ipo.gmp}` : '-')}</div>
          <div>Retail Subscription: {ipo.subscription_retail ? `${ipo.subscription_retail}x` : '-'}</div>
          <div>QIB Subscription: {ipo.subscription_qib ? `${ipo.subscription_qib}x` : '-'}</div>
          <div>NII Subscription: {ipo.subscription_nii ? `${ipo.subscription_nii}x` : '-'}</div>
          <div>Total Subscription: <span className="font-bold">{ipo.subscription_total ? `${ipo.subscription_total}x` : '-'}</span></div>
        </div>
      </div>

      {ipo.analyst_rating && (
        <div className="mt-6 p-5 bg-white rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Shield className="w-5 h-5"/> Analyst Rating</h2>
          <div className={`mt-2 text-2xl font-bold ${ipo.analyst_rating === 'Apply' ? 'text-green-600' : ipo.analyst_rating === 'Avoid' ? 'text-red-600' : 'text-gray-600'}`}>{ipo.analyst_rating}</div>
          {ipo.strengths && <p className="mt-2"><strong>Strengths:</strong> {ipo.strengths}</p>}
          {ipo.risks && <p><strong>Risks:</strong> {ipo.risks}</p>}
        </div>
      )}

      {ipo.company_profile && (
        <div className="mt-6 p-5 bg-white rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold">About Company</h2>
          <p className="mt-2">{ipo.company_profile}</p>
        </div>
      )}

      {ipo.financial_overview && (
        <div className="mt-6 p-5 bg-white rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold">Financial Overview</h2>
          <p className="mt-2">{ipo.financial_overview}</p>
        </div>
      )}
    </div>
  );
}
