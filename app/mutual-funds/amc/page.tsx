import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All AMCs (Fund Houses) in India | Share Target Price',
  description: 'Explore mutual funds from all Asset Management Companies (AMCs) in India. Find funds by fund house – SBI, HDFC, ICICI, Nippon, Kotak, and more.',
  keywords: 'AMC list, fund houses India, mutual fund companies, SBI Mutual Fund, HDFC Mutual Fund',
};

export default async function AMCListPage() {
  const { data: amcsData, error } = await supabase
    .from('mutual_funds')
    .select('fund_house')
    .not('fund_house', 'is', null)
    .order('fund_house', { ascending: true });

  if (error || !amcsData) {
    return <div className="text-center py-20">Error loading AMCs. Please try again later.</div>;
  }

  // ✅ Fix: use Array.from instead of spread operator
  const uniqueAMCs = Array.from(new Set(amcsData.map(item => item.fund_house)));
  const sortedAMCs = uniqueAMCs.sort();

  const getSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm mb-4">
            <Building2 className="w-4 h-4" />
            Asset Management Companies
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            All Fund Houses (AMCs) in India
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore mutual funds by Asset Management Company. Find top AMCs like SBI, HDFC, ICICI, Nippon, Kotak, and more.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">🏢 {sortedAMCs.length} Fund Houses</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedAMCs.map((amc) => (
            <Link
              key={amc}
              href={`/mutual-funds/amc/${getSlug(amc)}`}
              className="group bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex items-center justify-between"
            >
              <span className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                {amc}
              </span>
              <span className="text-orange-500 text-lg">→</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance does not guarantee future returns. Please read scheme documents carefully.
        </div>
      </div>
    </div>
  );
}
