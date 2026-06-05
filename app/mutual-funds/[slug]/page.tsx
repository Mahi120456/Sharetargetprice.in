import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  Clock,
  ShieldAlert,
  Building2,
  ArrowLeft,
  BarChart3,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

// Components
import ReturnsTable from '@/components/mutual-fund/ReturnsTable';
import SIPCalculator from '@/components/mutual-fund/SIPCalculator';
import TopHoldings from '@/components/mutual-fund/TopHoldings';
import Riskometer from '@/components/mutual-fund/Riskometer';
import AIOverview from '@/components/mutual-fund/AIOverview';
import AIAnalysis from '@/components/mutual-fund/AIAnalysis';
import ProsCons from '@/components/mutual-fund/ProsCons';
import FAQSection from '@/components/mutual-fund/FAQSection';
import RelatedFunds from '@/components/mutual-fund/RelatedFunds';
import ComparisonLinks from '@/components/mutual-fund/ComparisonLinks';
import FundExtraStats from '@/components/mutual-fund/FundExtraStats';

export const revalidate = 86400;
export const dynamicParams = true;
// ❌ Removed: export const dynamic = 'force-dynamic';

async function getFund(slug: string) {
  const { data, error } = await supabase
    .from('mutual_funds')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) {
    console.error(`Supabase error for ${slug}:`, error.message);
    return null;
  }
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const fund = await getFund(params.slug);
  if (!fund) return { title: 'Not Found' };
  return {
    title: fund.seo_title,
    description: fund.seo_description,
    keywords: fund.keywords,
    alternates: { canonical: `https://sharetargetprice.in/mutual-funds/${fund.slug}` },
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

export default async function MutualFundPage({ params }: { params: { slug: string } }) {
  const fund = await getFund(params.slug);
  if (!fund) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        {/* Back link */}
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        {/* Hero Card with gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-6 md:p-8 mb-8 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm">
                <Building2 className="w-3.5 h-3.5" />
                {fund.fund_house}
              </span>
              <span className="bg-white/80 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm">
                {fund.category}
              </span>
              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getRiskColor(fund.riskometer)}`}>
                {fund.riskometer} Risk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {fund.scheme_name}
            </h1>
            <div className="flex flex-wrap items-baseline gap-6 mt-2">
              <div>
                <span className="text-sm text-gray-500 block">Current NAV</span>
                <span className="text-3xl font-bold text-gray-900">₹{fund.nav?.toFixed(2)}</span>
                <span className="text-xs text-gray-400 ml-2">as of {new Date().toLocaleDateString('en-IN')}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">AUM</span>
                <span className="text-xl font-semibold text-gray-800">{formatAUM(fund.aum)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<DollarSign className="w-5 h-5" />} label="AUM" value={formatAUM(fund.aum)} />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Expense Ratio" value={`${fund.expense_ratio ?? 'N/A'}%`} />
          <StatCard icon={<Wallet className="w-5 h-5" />} label="Min SIP" value={`₹${fund.min_sip_amount ?? 'N/A'}`} />
          <StatCard icon={<PieChart className="w-5 h-5" />} label="Min Lumpsum" value={`₹${fund.min_lumpsum ?? 'N/A'}`} />
          <StatCard icon={<Calendar className="w-5 h-5" />} label="Launch Date" value={formatDate(fund.launch_date)} />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Exit Load" value={fund.exit_load || 'Nil'} />
        </div>

        {/* Riskometer */}
        <div className="mb-8">
          <Riskometer fund={fund} />
        </div>

        {/* Extra stats */}
        <FundExtraStats fund={fund} />

        {/* Top Holdings */}
        <div className="mb-8">
          <TopHoldings holdings={fund.top_holdings} date={fund.holdings_date} />
        </div>

        {/* AI Content Sections */}
        <div className="space-y-10">
          {fund.overview && (
            <Section title="Overview">
              <AIOverview content={fund.overview} fundName={fund.scheme_name} />
            </Section>
          )}
          {fund.analysis && (
            <Section title="Performance & Analysis">
              <AIAnalysis content={fund.analysis} />
            </Section>
          )}
          {fund.future_outlook && (
            <Section title="Who Should Invest?">
              <div dangerouslySetInnerHTML={{ __html: fund.future_outlook }} />
            </Section>
          )}
          {fund.pros_cons && (
            <Section title="Pros & Cons">
              <ProsCons content={fund.pros_cons} />
            </Section>
          )}
          {fund.faq && (
            <Section title="Frequently Asked Questions">
              <FAQSection content={fund.faq} />
            </Section>
          )}
        </div>

        {/* Returns Table */}
        <div className="mt-10 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Returns</h2>
          <ReturnsTable fund={fund} />
        </div>

        {/* SIP Calculator */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">SIP Calculator</h2>
          <SIPCalculator fund={fund} />
        </div>

        {/* Related Funds & Comparison Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Similar Funds</h2>
            <RelatedFunds fund={fund} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Compare with Alternatives</h2>
            <ComparisonLinks fund={fund} />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 bg-amber-50/70 border border-amber-100 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Please read all scheme‑related documents carefully before investing. Past performance does not guarantee future returns. The content on this page is for educational purposes only.
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="text-orange-500 bg-orange-50 p-2 rounded-full">{icon}</div>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="font-semibold text-gray-800">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3">{title}</h2>
      <div className="mutual-fund-content">{children}</div>
    </div>
  );
}
