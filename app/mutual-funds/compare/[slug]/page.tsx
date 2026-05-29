import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Shield, PieChart, DollarSign, Calendar, Clock, Building2, BarChart3, Activity, Award, Zap, Star } from 'lucide-react';
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

export const revalidate = 86400;
export const dynamicParams = true;

// ---------- STATIC PATH GENERATION (TOP 100 FUNDS) ----------
export async function generateStaticParams() {
  console.log('🔄 Generating static comparison paths...');
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
  return pairs;
}

// ---------- MAP SHORT SLUG TO FULL FUND DATA ----------
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
    title: `${fund1.scheme_name?.split(' - ')[0] || fund1.scheme_name} vs ${fund2.scheme_name?.split(' - ')[0] || fund2.scheme_name} – Detailed Comparison | ShareTargetPrice`,
    description: `Compare ${fund1.scheme_name} and ${fund2.scheme_name} side by side. See 1Y/3Y/5Y returns, NAV, AUM, expense ratio, risk level, holdings, and expert AI verdict.`,
  };
}

// ---------- FORMATTING HELPERS ----------
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

// ---------- MAIN PAGE ----------
export default async function ComparePage({ params }: { params: { slug: string } }) {
  const [short1, short2] = params.slug.split('-vs-');
  if (!short1 || !short2) notFound();

  const [fund1, fund2] = await Promise.all([getFundByShortSlug(short1), getFundByShortSlug(short2)]);
  if (!fund1 || !fund2) notFound();

  // Helper functions for table highlighting
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

  // Safe fund display names
  const name1 = fund1.scheme_name?.split(' - ')[0] || fund1.scheme_name;
  const name2 = fund2.scheme_name?.split(' - ')[0] || fund2.scheme_name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        {/* Navigation */}
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        {/* Hero Section with Thumbnails */}
        <div className="relative rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm border border-orange-100 p-6 md:p-8 mb-8 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="bg-white/80 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm">{fund1.category}</span>
                <span className="text-gray-400 text-sm font-medium">VS</span>
                <span className="bg-white/80 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm">{fund2.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {name1} vs {name2}
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto md:mx-0">
                Side-by-side comparison of returns, risk, expenses, holdings and performance. AI-powered insights included.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-1">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500">3Y Return</p>
                <p className={`font-bold text-lg ${(fund1.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatReturn(fund1.returns_3y)}
                </p>
              </div>
              <div className="text-2xl font-bold text-gray-400">VS</div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-1">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500">3Y Return</p>
                <p className={`font-bold text-lg ${(fund2.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatReturn(fund2.returns_3y)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Intro */}
        <AIIntro slug={params.slug} />

        {/* Comparison Table - Enhanced */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-1/3">Parameter</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-1/3">
                    <Link href={`/mutual-funds/${fund1.slug}`} className="hover:text-orange-600 transition-colors flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold">A</span>
                      {fund1.scheme_name}
                    </Link>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-1/3">
                    <Link href={`/mutual-funds/${fund2.slug}`} className="hover:text-orange-600 transition-colors flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold">B</span>
                      {fund2.scheme_name}
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Fund House */}
                <tr><td className="px-4 py-3 font-medium">Fund House</td><td>{fund1.fund_house}</td><td>{fund2.fund_house}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">Category</td><td>{fund1.category}</td><td>{fund2.category}</td></tr>
                <tr><td className="px-4 py-3 font-medium">NAV (₹)</td><td>{fund1.nav?.toFixed(2) ?? 'N/A'}</td><td>{fund2.nav?.toFixed(2) ?? 'N/A'}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">AUM (₹ Cr)</td><td className={higherAUM(fund1.aum, fund2.aum)}>{formatAUM(fund1.aum)}</td><td className={higherAUM(fund2.aum, fund1.aum)}>{formatAUM(fund2.aum)}</td></tr>
                <tr><td className="px-4 py-3 font-medium">Expense Ratio (%)</td><td className={lowerExpense(fund1.expense_ratio, fund2.expense_ratio)}>{formatPercentage(fund1.expense_ratio)}</td><td className={lowerExpense(fund2.expense_ratio, fund1.expense_ratio)}>{formatPercentage(fund2.expense_ratio)}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">Riskometer</td><td><span className={`inline-block px-2 py-1 rounded-full text-xs ${getRiskBadge(fund1.riskometer)}`}>{fund1.riskometer}</span></td><td><span className={`inline-block px-2 py-1 rounded-full text-xs ${getRiskBadge(fund2.riskometer)}`}>{fund2.riskometer}</span></td></tr>
                <tr><td className="px-4 py-3 font-medium">Volatility</td><td>{fund1.volatility ?? 'N/A'}</td><td>{fund2.volatility ?? 'N/A'}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">Sharpe Ratio</td><td>{fund1.sharpe_ratio ?? 'N/A'}</td><td>{fund2.sharpe_ratio ?? 'N/A'}</td></tr>
                <tr><td className="px-4 py-3 font-medium">1 Year Return (%)</td><td className={`${betterReturn(fund1.returns_1y, fund2.returns_1y)} ${(fund1.returns_1y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_1y)}</td><td className={`${betterReturn(fund2.returns_1y, fund1.returns_1y)} ${(fund2.returns_1y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_1y)}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">3 Year Return (%)</td><td className={`${betterReturn(fund1.returns_3y, fund2.returns_3y)} ${(fund1.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_3y)}</td><td className={`${betterReturn(fund2.returns_3y, fund1.returns_3y)} ${(fund2.returns_3y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_3y)}</td></tr>
                <tr><td className="px-4 py-3 font-medium">5 Year Return (%)</td><td className={`${betterReturn(fund1.returns_5y, fund2.returns_5y)} ${(fund1.returns_5y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund1.returns_5y)}</td><td className={`${betterReturn(fund2.returns_5y, fund1.returns_5y)} ${(fund2.returns_5y || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatReturn(fund2.returns_5y)}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">Since Launch (%)</td><td>{formatReturn(fund1.returns_since_launch)}</td><td>{formatReturn(fund2.returns_since_launch)}</td></tr>
                <tr><td className="px-4 py-3 font-medium">Min SIP (₹)</td><td>{fund1.min_sip_amount ?? 'N/A'}</td><td>{fund2.min_sip_amount ?? 'N/A'}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">Min Lumpsum (₹)</td><td>{fund1.min_lumpsum ?? 'N/A'}</td><td>{fund2.min_lumpsum ?? 'N/A'}</td></tr>
                <tr><td className="px-4 py-3 font-medium">Launch Date</td><td>{formatDate(fund1.launch_date)}</td><td>{formatDate(fund2.launch_date)}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">Exit Load</td><td>{fund1.exit_load || 'Nil'}</td><td>{fund2.exit_load || 'Nil'}</td></tr>
                <tr><td className="px-4 py-3 font-medium">Fund Manager</td><td>{fund1.fund_manager ?? 'N/A'} {fund1.fund_manager_tenure ? `(${fund1.fund_manager_tenure} yrs)` : ''}</td><td>{fund2.fund_manager ?? 'N/A'} {fund2.fund_manager_tenure ? `(${fund2.fund_manager_tenure} yrs)` : ''}</td></tr>
                <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">Benchmark</td><td>{fund1.benchmark ?? 'N/A'}</td><td>{fund2.benchmark ?? 'N/A'}</td></tr>
                <tr><td className="px-4 py-3 font-medium">Top 3 Holdings</td><td className="text-xs">{getTopHoldingsPreview(fund1.top_holdings)}</td><td className="text-xs">{getTopHoldingsPreview(fund2.top_holdings)}</td></tr>
                {fund1.asset_allocation && fund2.asset_allocation && (
                  <tr className="bg-gray-50/50"><td className="px-4 py-3 font-medium">Asset Allocation</td><td className="text-xs">{fund1.asset_allocation}</td><td className="text-xs">{fund2.asset_allocation}</td></tr>
                )}
                {fund1.portfolio_turnover && fund2.portfolio_turnover && (
                  <tr><td className="px-4 py-3 font-medium">Portfolio Turnover</td><td>{fund1.portfolio_turnover}%</td><td>{fund2.portfolio_turnover}%</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Verdict */}
        <AIVerdict slug={params.slug} />

        {/* Why Consider Cards - Enhanced */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
            <h3 className="font-bold text-lg mb-2 text-orange-600 flex items-center gap-2"><Zap className="w-5 h-5" /> Why consider {name1}?</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Expense ratio: {fund1.expense_ratio ?? 'N/A'}%</li>
              <li>3Y return: {fund1.returns_3y ?? 'N/A'}%</li>
              <li>AUM: {formatAUM(fund1.aum)}</li>
              {fund1.sharpe_ratio && <li>Sharpe Ratio: {fund1.sharpe_ratio}</li>}
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
            <h3 className="font-bold text-lg mb-2 text-orange-600 flex items-center gap-2"><Award className="w-5 h-5" /> Why consider {name2}?</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Expense ratio: {fund2.expense_ratio ?? 'N/A'}%</li>
              <li>3Y return: {fund2.returns_3y ?? 'N/A'}%</li>
              <li>AUM: {formatAUM(fund2.aum)}</li>
              {fund2.sharpe_ratio && <li>Sharpe Ratio: {fund2.sharpe_ratio}</li>}
            </ul>
          </div>
        </div>

        {/* AI Sections */}
        <AISIPSuitability slug={params.slug} />
        <AIRiskCost slug={params.slug} />
        <AIPortfolioInsight slug={params.slug} />

        {/* SIP Calculator */}
        <ComparisonSIPCalculator fund1={fund1} fund2={fund2} />

        {/* FAQ */}
        <AIFAQ slug={params.slug} />

        {/* Author Card */}
        {author && <AuthorCard author={author} />}

        {/* More Comparisons */}
        <div className="mt-10 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2"><Activity className="w-5 h-5" /> Explore More Comparisons</h3>
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
          <strong>⚠️ Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance does not guarantee future returns. AI-generated insights are based solely on historical data and do not constitute investment advice. Please consult your SEBI-registered financial advisor.
        </div>
      </div>
    </div>
  );
}
