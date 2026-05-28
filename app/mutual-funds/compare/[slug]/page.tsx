import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, TrendingUp, Shield, PieChart, DollarSign, Calendar, Clock, Building2, BarChart3 } from 'lucide-react';
import { getShortSlugFromName } from '@/lib/shortSlug';
import AIIntro from '@/components/mutual-fund/AIIntro';
import AIVerdict from '@/components/mutual-fund/AIVerdict';
import AISIPSuitability from '@/components/mutual-fund/AISIPSuitability';
import AIRiskCost from '@/components/mutual-fund/AIRiskCost';
import AIPortfolioInsight from '@/components/mutual-fund/AIPortfolioInsight';
import AIFAQ from '@/components/mutual-fund/AIFAQ';
import ComparisonSIPCalculator from '@/components/mutual-fund/ComparisonSIPCalculator';
import AuthorCard from '@/components/AuthorCard';
import { getAuthorBySlug } from '@/data/authors';

export const revalidate = 86400; // ISR – revalidate every 24 hours

// ---------- STATIC PATH GENERATION (TOP 100 FUNDS, SHORT SLUGS) ----------
export async function generateStaticParams() {
  console.log('🔄 Generating static comparison pages (short slugs)...');
  const { data: funds } = await supabase
    .from('mutual_funds')
    .select('slug, scheme_name, aum')
    .not('aum', 'is', null)
    .order('aum', { ascending: false })
    .limit(100);

  if (!funds || funds.length === 0) return [];

  const fundsWithShort = funds.map(f => ({
    shortSlug: getShortSlugFromName(f.scheme_name),
  }));

  const pairs = [];
  for (let i = 0; i < fundsWithShort.length; i++) {
    for (let j = i + 1; j < fundsWithShort.length; j++) {
      pairs.push({ slug: `${fundsWithShort[i].shortSlug}-vs-${fundsWithShort[j].shortSlug}` });
    }
  }
  console.log(`✅ Generated ${pairs.length} static comparison paths`);
  return pairs;
}

// ---------- HELPER: MAP SHORT SLUG TO FULL FUND DATA ----------
let cachedFundsMap: Map<string, any> | null = null;

async function getFundsMap() {
  if (cachedFundsMap) return cachedFundsMap;
  const { data: funds } = await supabase.from('mutual_funds').select('*');
  const map = new Map();
  funds?.forEach(f => {
    const short = getShortSlugFromName(f.scheme_name);
    map.set(short, f);
  });
  cachedFundsMap = map;
  return map;
}

async function getFundByShortSlug(shortSlug: string) {
  const map = await getFundsMap();
  return map.get(shortSlug) || null;
}

// ---------- METADATA ----------
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const [short1, short2] = params.slug.split('-vs-');
  if (!short1 || !short2) return { title: 'Invalid Comparison' };
  const [fund1, fund2] = await Promise.all([getFundByShortSlug(short1), getFundByShortSlug(short2)]);
  if (!fund1 || !fund2) return { title: 'Fund Not Found' };
  return {
    title: `${fund1.scheme_name.split(' - ')[0]} vs ${fund2.scheme_name.split(' - ')[0]} – Detailed Comparison | ShareTargetPrice`,
    description: `Compare ${fund1.scheme_name} and ${fund2.scheme_name} side by side. See 1Y/3Y/5Y returns, NAV, AUM, expense ratio, risk level, holdings, and expert AI verdict. Decide which fund is better for your portfolio.`,
    openGraph: {
      title: `${fund1.scheme_name} vs ${fund2.scheme_name} – Which is Better?`,
      description: `Compare returns, risk, expenses, and holdings. AI-powered verdict included.`,
    },
  };
}

// ---------- HELPER FUNCTIONS (TABLE FORMATTING) ----------
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
    Low: 'bg-green-100 text-green-800',
    Moderate: 'bg-blue-100 text-blue-800',
    'Moderately High': 'bg-orange-100 text-orange-800',
    High: 'bg-red-100 text-red-800',
    'Very High': 'bg-red-200 text-red-900',
  };
  return colors[risk] || 'bg-gray-100 text-gray-800';
}
function formatReturn(value: number | null | undefined) {
  return value != null ? `${value}%` : 'N/A';
}
function formatPercentage(value: number | null | undefined) {
  return value != null ? `${value}%` : 'N/A';
}

// ---------- MAIN PAGE COMPONENT ----------
export default async function ComparePage({ params }: { params: { slug: string } }) {
  const [short1, short2] = params.slug.split('-vs-');
  if (!short1 || !short2) notFound();

  const [fund1, fund2] = await Promise.all([getFundByShortSlug(short1), getFundByShortSlug(short2)]);
  if (!fund1 || !fund2) notFound();

  // Helper comparisons for highlighting
  const betterReturn = (ret1: number | null | undefined, ret2: number | null | undefined) => {
    if (ret1 == null || ret2 == null) return '';
    return ret1 > ret2 ? 'bg-green-50 font-semibold' : ret2 > ret1 ? 'bg-green-50 font-semibold' : '';
  };
  const lowerExpense = (exp1: number | null | undefined, exp2: number | null | undefined) => {
    if (!exp1 || !exp2) return '';
    return exp1 < exp2 ? 'bg-green-50 font-semibold' : exp2 < exp1 ? 'bg-green-50 font-semibold' : '';
  };
  const higherAUM = (aum1: number, aum2: number) => {
    if (!aum1 || !aum2) return '';
    return aum1 > aum2 ? 'bg-green-50 font-semibold' : aum2 > aum1 ? 'bg-green-50 font-semibold' : '';
  };
  const getTopHoldingsPreview = (holdings: string | undefined) => {
    if (!holdings) return 'N/A';
    return holdings.split('|').slice(0, 3).map(h => h.trim()).join(', ');
  };

  const author = getAuthorBySlug('mahendra-maurya');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        {/* Navigation */}
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        {/* AI-Generated Intro (top) */}
        <AIIntro slug={params.slug} />

        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {fund1.scheme_name.split(' - ')[0]} vs {fund2.scheme_name.split(' - ')[0]}
          </h1>
          <p className="text-gray-600">Side-by-side comparison of returns, risk, expenses, holdings and performance</p>
        </div>

        {/* ---------- COMPARISON TABLE ---------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
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
                {/* Fund House */}
                <tr><td className="px-4 py-3 font-medium">Fund House</td><td>{fund1.fund_house}</td><td>{fund2.fund_house}</td></tr>
                {/* Category */}
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Category</td><td>{fund1.category}</td><td>{fund2.category}</td></tr>
                {/* NAV */}
                <tr><td className="px-4 py-3 font-medium">NAV (₹)</td><td>{fund1.nav?.toFixed(2) ?? 'N/A'}</td><td>{fund2.nav?.toFixed(2) ?? 'N/A'}</td></tr>
                {/* AUM */}
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">AUM (₹ Cr)</td><td className={higherAUM(fund1.aum, fund2.aum)}>{formatAUM(fund1.aum)}</td><td className={higherAUM(fund2.aum, fund1.aum)}>{formatAUM(fund2.aum)}</td></tr>
                {/* Expense Ratio */}
                <tr><td className="px-4 py-3 font-medium">Expense Ratio (%)</td><td className={lowerExpense(fund1.expense_ratio, fund2.expense_ratio)}>{formatPercentage(fund1.expense_ratio)}</td><td className={lowerExpense(fund2.expense_ratio, fund1.expense_ratio)}>{formatPercentage(fund2.expense_ratio)}</td></tr>
                {/* Riskometer */}
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Riskometer</td><td><span className={`inline-block px-2 py-1 rounded-full text-xs ${getRiskBadge(fund1.riskometer)}`}>{fund1.riskometer}</span></td><td><span className={`inline-block px-2 py-1 rounded-full text-xs ${getRiskBadge(fund2.riskometer)}`}>{fund2.riskometer}</span></td></tr>
                {/* Volatility */}
                <tr><td className="px-4 py-3 font-medium">Volatility</td><td>{fund1.volatility ?? 'N/A'}</td><td>{fund2.volatility ?? 'N/A'}</td></tr>
                {/* Sharpe Ratio */}
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Sharpe Ratio</td><td>{fund1.sharpe_ratio ?? 'N/A'}</td><td>{fund2.sharpe_ratio ?? 'N/A'}</td></tr>
                {/* Returns */}
                <tr><td className="px-4 py-3 font-medium">1 Year Return (%)</td><td className={`${betterReturn(fund1.returns_1y, fund2.returns_1y)} ${(fund1.returns_1y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_1y)}</td><td className={`${betterReturn(fund2.returns_1y, fund1.returns_1y)} ${(fund2.returns_1y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_1y)}</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">3 Year Return (%)</td><td className={`${betterReturn(fund1.returns_3y, fund2.returns_3y)} ${(fund1.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_3y)}</td><td className={`${betterReturn(fund2.returns_3y, fund1.returns_3y)} ${(fund2.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_3y)}</td></tr>
                <tr><td className="px-4 py-3 font-medium">5 Year Return (%)</td><td className={`${betterReturn(fund1.returns_5y, fund2.returns_5y)} ${(fund1.returns_5y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_5y)}</td><td className={`${betterReturn(fund2.returns_5y, fund1.returns_5y)} ${(fund2.returns_5y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_5y)}</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Since Launch (%)</td><td>{formatReturn(fund1.returns_since_launch)}</td><td>{formatReturn(fund2.returns_since_launch)}</td></tr>
                {/* SIP & Lumpsum */}
                <tr><td className="px-4 py-3 font-medium">Min SIP (₹)</td><td>{fund1.min_sip_amount ?? 'N/A'}</td><td>{fund2.min_sip_amount ?? 'N/A'}</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Min Lumpsum (₹)</td><td>{fund1.min_lumpsum ?? 'N/A'}</td><td>{fund2.min_lumpsum ?? 'N/A'}</td></tr>
                <tr><td className="px-4 py-3 font-medium">Launch Date</td><td>{formatDate(fund1.launch_date)}</td><td>{formatDate(fund2.launch_date)}</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Exit Load</td><td>{fund1.exit_load || 'Nil'}</td><td>{fund2.exit_load || 'Nil'}</td></tr>
                {/* Fund Manager */}
                <tr><td className="px-4 py-3 font-medium">Fund Manager</td><td>{fund1.fund_manager ?? 'N/A'} {fund1.fund_manager_tenure ? `(${fund1.fund_manager_tenure} yrs)` : ''}</td><td>{fund2.fund_manager ?? 'N/A'} {fund2.fund_manager_tenure ? `(${fund2.fund_manager_tenure} yrs)` : ''}</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Benchmark</td><td>{fund1.benchmark ?? 'N/A'}</td><td>{fund2.benchmark ?? 'N/A'}</td></tr>
                {/* Top Holdings */}
                <tr><td className="px-4 py-3 font-medium">Top 3 Holdings</td><td className="text-xs">{getTopHoldingsPreview(fund1.top_holdings)}</td><td className="text-xs">{getTopHoldingsPreview(fund2.top_holdings)}</td></tr>
                {/* Asset Allocation (if available) */}
                {fund1.asset_allocation && fund2.asset_allocation && (
                  <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Asset Allocation</td><td className="text-xs">{fund1.asset_allocation}</td><td className="text-xs">{fund2.asset_allocation}</td></tr>
                )}
                {/* Portfolio Turnover (if available) */}
                {fund1.portfolio_turnover && fund2.portfolio_turnover && (
                  <tr><td className="px-4 py-3 font-medium">Portfolio Turnover</td><td>{fund1.portfolio_turnover}%</td><td>{fund2.portfolio_turnover}%</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Verdict – immediately after table */}
        <AIVerdict slug={params.slug} />

        {/* Why Consider Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg mb-2 text-orange-600">✅ Why consider {fund1.scheme_name.split(' ').slice(0,2).join(' ')}?</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Expense ratio: {fund1.expense_ratio ?? 'N/A'}%</li>
              <li>3Y return: {fund1.returns_3y ?? 'N/A'}%</li>
              <li>AUM: {formatAUM(fund1.aum)}</li>
              {fund1.sharpe_ratio && <li>Sharpe Ratio: {fund1.sharpe_ratio}</li>}
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg mb-2 text-orange-600">✅ Why consider {fund2.scheme_name.split(' ').slice(0,2).join(' ')}?</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Expense ratio: {fund2.expense_ratio ?? 'N/A'}%</li>
              <li>3Y return: {fund2.returns_3y ?? 'N/A'}%</li>
              <li>AUM: {formatAUM(fund2.aum)}</li>
              {fund2.sharpe_ratio && <li>Sharpe Ratio: {fund2.sharpe_ratio}</li>}
            </ul>
          </div>
        </div>

        {/* AI Sections – SIP Suitability, Risk/Cost, Portfolio Insight */}
        <AISIPSuitability slug={params.slug} />
        <AIRiskCost slug={params.slug} />
        <AIPortfolioInsight slug={params.slug} />

        {/* SIP Calculator (side-by-side) */}
        <ComparisonSIPCalculator fund1={fund1} fund2={fund2} />

        {/* AI Generated FAQ */}
        <AIFAQ slug={params.slug} />

        {/* Author Card (EEAT) */}
        {author && <AuthorCard author={author} />}

        {/* Internal Linking – Related Comparisons (you can enhance later) */}
        <div className="mt-10 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-lg mb-3 text-gray-800">🔍 More Comparisons</h3>
          <div className="flex flex-wrap gap-3">
            {[fund1, fund2].map(f => (
              <Link key={f.slug} href={`/mutual-funds/category/${f.category.toLowerCase().replace(/ /g, '-')}`} className="text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors">
                📁 {f.category} Funds
              </Link>
            ))}
            <Link href="/mutual-funds/top-performing-funds" className="text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors">
              🏆 Top Performing Funds
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <strong>⚠️ Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance does not guarantee future returns. AI-generated insights are based solely on historical data and do not constitute investment advice. Please consult your SEBI-registered financial advisor before making any investment decisions.
        </div>
      </div>
    </div>
  );
}
