import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 86400;
export const dynamicParams = true;

// Generate static paths for all AMCs
export async function generateStaticParams() {
  const { data } = await supabase
    .from('mutual_funds')
    .select('fund_house')
    .not('fund_house', 'is', null);
  
  const uniqueAMCs = Array.from(new Set(data?.map(item => item.fund_house) || []));
  
  return uniqueAMCs.map(amc => ({
    amc: encodeURIComponent(amc.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  }));
}

async function getAMCFunds(amcSlug: string) {
  // Convert slug back to fund house name (e.g., "sbi-mutual-fund" -> "SBI Mutual Fund")
  const fundHouseName = amcSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const { data, error } = await supabase
    .from('mutual_funds')
    .select('*')
    .ilike('fund_house', `%${fundHouseName}%`)
    .order('aum', { ascending: false });
  
  if (error) return { funds: [], fundHouseName };
  return { funds: data || [], fundHouseName };
}

export async function generateMetadata({ params }: { params: { amc: string } }): Promise<Metadata> {
  const { fundHouseName, funds } = await getAMCFunds(params.amc);
  if (!funds.length) return { title: 'AMC Not Found' };
  
  return {
    title: `${fundHouseName} Mutual Funds - List, NAV, Returns | ShareTargetPrice`,
    description: `Explore all mutual funds from ${fundHouseName}. Compare NAV, AUM, expense ratio, SIP returns and risk ratings. Find the best ${fundHouseName} funds for your portfolio.`,
    keywords: `${fundHouseName} mutual funds, ${fundHouseName} funds list, ${fundHouseName} NAV, ${fundHouseName} returns, invest in ${fundHouseName}`,
    alternates: { canonical: `https://sharetargetprice.in/mutual-funds/amc/${params.amc}` },
  };
}

function formatAUM(aum: number) {
  if (!aum) return 'N/A';
  if (aum >= 10000) return `${(aum / 10000).toFixed(2)} Lac Cr`;
  return `${aum.toFixed(2)} Cr`;
}

function getRiskColor(risk: string) {
  switch (risk?.toLowerCase()) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'moderate': return 'bg-blue-100 text-blue-800';
    case 'moderately high': return 'bg-orange-100 text-orange-800';
    case 'high':
    case 'very high': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function AMCPage({ params }: { params: { amc: string } }) {
  const { funds, fundHouseName } = await getAMCFunds(params.amc);
  
  if (!funds.length) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        {/* Back link */}
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {fundHouseName} Mutual Funds
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl">
            Explore all mutual funds offered by {fundHouseName}. Compare returns, NAV, expense ratio and risk levels to find the best fund for your investment goals.
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">📊 {funds.length} Funds</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">💰 Total AUM: {formatAUM(funds.reduce((sum, f) => sum + (f.aum || 0), 0))}</span>
          </div>
        </div>

        {/* Fund Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds.map((fund) => (
            <Link
              key={fund.slug}
              href={`/mutual-funds/${fund.slug}`}
              className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {fund.scheme_name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{fund.category}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(fund.riskometer)}`}>
                  {fund.riskometer}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">NAV</span>
                  <p className="font-semibold">₹{fund.nav?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">AUM</span>
                  <p className="font-semibold">{formatAUM(fund.aum)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Expense</span>
                  <p className="font-semibold">{fund.expense_ratio ?? 'N/A'}%</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Min SIP</span>
                  <p className="font-semibold">₹{fund.min_sip_amount ?? 'N/A'}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs">
                <div>
                  <span className="text-gray-500">1Y Return</span>
                  <p className={`font-medium ${(fund.returns_1y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fund.returns_1y ?? 'N/A'}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">3Y Return</span>
                  <p className={`font-medium ${(fund.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fund.returns_3y ?? 'N/A'}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">5Y Return</span>
                  <p className={`font-medium ${(fund.returns_5y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fund.returns_5y ?? 'N/A'}%
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance does not guarantee future returns. Please read scheme documents carefully.
        </div>
      </div>
    </div>
  );
}
