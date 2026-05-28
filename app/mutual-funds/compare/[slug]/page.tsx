import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, PieChart, DollarSign, Calendar, Clock, Building2, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

interface Fund {
  slug: string;
  scheme_name: string;
  fund_house: string;
  category: string;
  nav: number;
  aum: number;
  expense_ratio: number;
  returns_1y: number;
  returns_3y: number;
  returns_5y: number;
  returns_since_launch: number;
  riskometer: string;
  volatility?: number;
  sharpe_ratio?: number;
  fund_manager?: string;
  fund_manager_tenure?: string;
  min_sip_amount: number;
  min_lumpsum: number;
  launch_date: string;
  exit_load: string;
  top_holdings?: string;
  benchmark?: string;
}

async function getFundsFromSlugs(slug1: string, slug2: string): Promise<[Fund | null, Fund | null]> {
  const { data: fund1 } = await supabase
    .from('mutual_funds')
    .select('*')
    .eq('slug', slug1)
    .single();
  const { data: fund2 } = await supabase
    .from('mutual_funds')
    .select('*')
    .eq('slug', slug2)
    .single();
  return [fund1, fund2];
}

function parseCompareSlug(compareSlug: string): { slug1: string; slug2: string } | null {
  const parts = compareSlug.split('-vs-');
  if (parts.length !== 2) return null;
  return { slug1: parts[0], slug2: parts[1] };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const parsed = parseCompareSlug(params.slug);
  if (!parsed) return { title: 'Invalid Comparison' };
  const [fund1, fund2] = await getFundsFromSlugs(parsed.slug1, parsed.slug2);
  if (!fund1 || !fund2) return { title: 'Fund Not Found' };
  return {
    title: `${fund1.scheme_name} vs ${fund2.scheme_name} - Compare Mutual Funds | ShareTargetPrice`,
    description: `Compare ${fund1.scheme_name} and ${fund2.scheme_name} side by side. See returns, NAV, AUM, expense ratio, risk, holdings and more. Decide which fund is better for your portfolio.`,
    alternates: { canonical: `https://sharetargetprice.in/mutual-funds/compare/${params.slug}` },
  };
}

function formatAUM(aum: number) {
  if (!aum) return 'N/A';
  if (aum >= 10000) return `${(aum / 10000).toFixed(2)} Lac Cr`;
  return `${aum.toFixed(2)} Cr`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getRiskBadge(risk: string) {
  const colors: Record<string, string> = {
    'Low': 'bg-green-100 text-green-800',
    'Moderate': 'bg-blue-100 text-blue-800',
    'Moderately High': 'bg-orange-100 text-orange-800',
    'High': 'bg-red-100 text-red-800',
    'Very High': 'bg-red-200 text-red-900',
  };
  return colors[risk] || 'bg-gray-100 text-gray-800';
}

function formatReturn(value: number | null | undefined) {
  if (value === undefined || value === null) return 'N/A';
  return `${value}%`;
}

function formatPercentage(value: number | null | undefined) {
  if (value === undefined || value === null) return 'N/A';
  return `${value}%`;
}

export default async function ComparePage({ params }: { params: { slug: string } }) {
  const parsed = parseCompareSlug(params.slug);
  if (!parsed) notFound();

  const [fund1, fund2] = await getFundsFromSlugs(parsed.slug1, parsed.slug2);
  if (!fund1 || !fund2) notFound();

  // Helper to compare values and highlight better one
  const betterReturn = (ret1: number | null | undefined, ret2: number | null | undefined) => {
    if (ret1 === undefined || ret2 === undefined) return '';
    if (ret1 === null && ret2 === null) return '';
    if (ret1 === null) return 'opacity-50';
    if (ret2 === null) return 'opacity-50';
    if (ret1 > ret2) return 'bg-green-50 font-semibold';
    if (ret2 > ret1) return 'bg-green-50 font-semibold';
    return '';
  };

  const lowerExpense = (exp1: number | null | undefined, exp2: number | null | undefined) => {
    if (!exp1 || !exp2) return '';
    if (exp1 < exp2) return 'bg-green-50 font-semibold';
    if (exp2 < exp1) return 'bg-green-50 font-semibold';
    return '';
  };

  const higherAUM = (aum1: number, aum2: number) => {
    if (!aum1 || !aum2) return '';
    if (aum1 > aum2) return 'bg-green-50 font-semibold';
    if (aum2 > aum1) return 'bg-green-50 font-semibold';
    return '';
  };

  // Parse top holdings for tooltip (optional)
  const getTopHoldingsPreview = (holdings: string | undefined) => {
    if (!holdings) return 'N/A';
    const items = holdings.split('|').slice(0, 3).map(h => h.trim());
    return items.join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        {/* Back link */}
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {fund1.scheme_name} vs {fund2.scheme_name}
          </h1>
          <p className="text-gray-600">Side-by-side comparison of returns, risk, expenses and key metrics</p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-1/3">Parameter</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-1/3">
                    <Link href={`/mutual-funds/${fund1.slug}`} className="hover:text-orange-600 transition-colors">
                      {fund1.scheme_name}
                    </Link>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-1/3">
                    <Link href={`/mutual-funds/${fund2.slug}`} className="hover:text-orange-600 transition-colors">
                      {fund2.scheme_name}
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Fund House & Category */}
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Fund House</td>
                  <td className="px-4 py-3">{fund1.fund_house}</td>
                  <td className="px-4 py-3">{fund2.fund_house}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Category</td>
                  <td className="px-4 py-3">{fund1.category}</td>
                  <td className="px-4 py-3">{fund2.category}</td>
                </tr>

                {/* NAV & AUM */}
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">NAV (₹)</td>
                  <td className="px-4 py-3">{fund1.nav?.toFixed(2) ?? 'N/A'}</td>
                  <td className="px-4 py-3">{fund2.nav?.toFixed(2) ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">AUM (₹ Cr)</td>
                  <td className={`px-4 py-3 ${higherAUM(fund1.aum, fund2.aum)}`}>{formatAUM(fund1.aum)}</td>
                  <td className={`px-4 py-3 ${higherAUM(fund2.aum, fund1.aum)}`}>{formatAUM(fund2.aum)}</td>
                </tr>

                {/* Expense & Risk */}
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Expense Ratio (%)</td>
                  <td className={`px-4 py-3 ${lowerExpense(fund1.expense_ratio, fund2.expense_ratio)}`}>{formatPercentage(fund1.expense_ratio)}</td>
                  <td className={`px-4 py-3 ${lowerExpense(fund2.expense_ratio, fund1.expense_ratio)}`}>{formatPercentage(fund2.expense_ratio)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Riskometer</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-1 rounded-full text-xs ${getRiskBadge(fund1.riskometer)}`}>{fund1.riskometer}</span></td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-1 rounded-full text-xs ${getRiskBadge(fund2.riskometer)}`}>{fund2.riskometer}</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Volatility</td>
                  <td className="px-4 py-3">{fund1.volatility ?? 'N/A'}</td>
                  <td className="px-4 py-3">{fund2.volatility ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Sharpe Ratio</td>
                  <td className="px-4 py-3">{fund1.sharpe_ratio ?? 'N/A'}</td>
                  <td className="px-4 py-3">{fund2.sharpe_ratio ?? 'N/A'}</td>
                </tr>

                {/* Returns */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">1 Year Return (%)</td>
                  <td className={`px-4 py-3 ${betterReturn(fund1.returns_1y, fund2.returns_1y)} ${(fund1.returns_1y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_1y)}</td>
                  <td className={`px-4 py-3 ${betterReturn(fund2.returns_1y, fund1.returns_1y)} ${(fund2.returns_1y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_1y)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">3 Year Return (%)</td>
                  <td className={`px-4 py-3 ${betterReturn(fund1.returns_3y, fund2.returns_3y)} ${(fund1.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_3y)}</td>
                  <td className={`px-4 py-3 ${betterReturn(fund2.returns_3y, fund1.returns_3y)} ${(fund2.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_3y)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">5 Year Return (%)</td>
                  <td className={`px-4 py-3 ${betterReturn(fund1.returns_5y, fund2.returns_5y)} ${(fund1.returns_5y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_5y)}</td>
                  <td className={`px-4 py-3 ${betterReturn(fund2.returns_5y, fund1.returns_5y)} ${(fund2.returns_5y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_5y)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Since Launch (%)</td>
                  <td className="px-4 py-3">{formatReturn(fund1.returns_since_launch)}</td>
                  <td className="px-4 py-3">{formatReturn(fund2.returns_since_launch)}</td>
                </tr>

                {/* SIP & Minimums */}
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Min SIP (₹)</td>
                  <td className="px-4 py-3">{fund1.min_sip_amount ?? 'N/A'}</td>
                  <td className="px-4 py-3">{fund2.min_sip_amount ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Min Lumpsum (₹)</td>
                  <td className="px-4 py-3">{fund1.min_lumpsum ?? 'N/A'}</td>
                  <td className="px-4 py-3">{fund2.min_lumpsum ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Launch Date</td>
                  <td className="px-4 py-3">{formatDate(fund1.launch_date)}</td>
                  <td className="px-4 py-3">{formatDate(fund2.launch_date)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Exit Load</td>
                  <td className="px-4 py-3">{fund1.exit_load || 'Nil'}</td>
                  <td className="px-4 py-3">{fund2.exit_load || 'Nil'}</td>
                </tr>

                {/* Fund Manager */}
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Fund Manager</td>
                  <td className="px-4 py-3">{fund1.fund_manager ?? 'N/A'} {fund1.fund_manager_tenure ? `(${fund1.fund_manager_tenure} yrs)` : ''}</td>
                  <td className="px-4 py-3">{fund2.fund_manager ?? 'N/A'} {fund2.fund_manager_tenure ? `(${fund2.fund_manager_tenure} yrs)` : ''}</td>
                </tr>

                {/* Benchmark */}
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Benchmark</td>
                  <td className="px-4 py-3">{fund1.benchmark ?? 'N/A'}</td>
                  <td className="px-4 py-3">{fund2.benchmark ?? 'N/A'}</td>
                </tr>

                {/* Top Holdings Preview */}
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Top 3 Holdings</td>
                  <td className="px-4 py-3 text-xs">{getTopHoldingsPreview(fund1.top_holdings)}</td>
                  <td className="px-4 py-3 text-xs">{getTopHoldingsPreview(fund2.top_holdings)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Verdict Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-lg mb-2 text-orange-600">Why consider {fund1.scheme_name.split(' ').slice(0,2).join(' ')}?</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Expense ratio: {fund1.expense_ratio ?? 'N/A'}%</li>
              <li>3Y return: {fund1.returns_3y ?? 'N/A'}%</li>
              <li>AUM: {formatAUM(fund1.aum)}</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-lg mb-2 text-orange-600">Why consider {fund2.scheme_name.split(' ').slice(0,2).join(' ')}?</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Expense ratio: {fund2.expense_ratio ?? 'N/A'}%</li>
              <li>3Y return: {fund2.returns_3y ?? 'N/A'}%</li>
              <li>AUM: {formatAUM(fund2.aum)}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance does not guarantee future returns. The comparison is for educational purposes only. Please consult your advisor before investing.
        </div>
      </div>
    </div>
  );
}
