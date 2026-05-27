import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import Image from 'next/image';
import Link from 'next/link';
import {
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  Activity,
  BarChart3,
  Wallet,
  Briefcase,
} from 'lucide-react';

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

export const revalidate = 86400;
export const dynamicParams = true;

// Generate static params from CSV
export async function generateStaticParams() {
  const slugs: { slug: string }[] = [];
  const filePath = path.join(process.cwd(), 'data', '500_mutual_funds_PHASE6_INSTITUTIONAL.csv');

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        let slug = row.scheme_name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (slug) slugs.push({ slug });
      })
      .on('end', () => resolve())
      .on('error', reject);
  });
  return slugs;
}

// Fetch fund data from Supabase
async function getFund(slug: string) {
  const { data, error } = await supabase
    .from('mutual_funds')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
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

export default async function MutualFundPage({ params }: { params: { slug: string } }) {
  const fund = await getFund(params.slug);
  if (!fund) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Hero Section – Premium Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-2xl mb-12">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px] opacity-20"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500 rounded-full filter blur-[100px] opacity-20"></div>

          <div className="relative z-10 p-6 md:p-10">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="backdrop-blur-md bg-white/10 border border-white/20 text-white text-sm px-4 py-1.5 rounded-full">
                {fund.fund_house}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full">
                {fund.category}
              </span>
              <span className={`text-sm px-4 py-1.5 rounded-full font-medium text-white shadow-sm ${
                fund.riskometer === 'Low' ? 'bg-green-500' :
                fund.riskometer === 'Moderate' ? 'bg-blue-500' :
                fund.riskometer === 'Moderately High' ? 'bg-orange-500' :
                'bg-red-500'
              }`}>
                {fund.riskometer} Risk
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-8 max-w-4xl">
              {fund.scheme_name}
            </h1>

            {/* Key metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Current NAV', value: `₹${fund.nav?.toFixed(2)}`, icon: DollarSign, color: 'blue' },
                { label: 'AUM', value: formatAUM(fund.aum), icon: PieChart, color: 'green' },
                { label: 'Expense Ratio', value: `${fund.expense_ratio ?? 'N/A'}%`, icon: TrendingUp, color: 'orange' },
                { label: 'Min SIP', value: `₹${fund.min_sip_amount ?? '500'}`, icon: Wallet, color: 'purple' },
              ].map((metric, idx) => (
                <div key={idx} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-${metric.color}-500/20`}>
                      <metric.icon className={`w-5 h-5 text-${metric.color}-300`} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-300">{metric.label}</div>
                      <div className="text-xl font-bold text-white">{metric.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fund Details Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mb-12 transition-all hover:shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Fund Snapshot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, label: 'AUM', value: formatAUM(fund.aum), color: 'blue' },
              { icon: TrendingUp, label: 'Expense Ratio', value: `${fund.expense_ratio ?? 'N/A'}%`, color: 'orange' },
              { icon: PieChart, label: 'Min SIP', value: `₹${fund.min_sip_amount ?? 'N/A'}`, color: 'green' },
              { icon: PieChart, label: 'Min Lumpsum', value: `₹${fund.min_lumpsum ?? 'N/A'}`, color: 'purple' },
              { icon: Calendar, label: 'Launch Date', value: formatDate(fund.launch_date), color: 'pink' },
              { icon: Clock, label: 'Exit Load', value: fund.exit_load || 'Nil', color: 'red' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100 transition">
                <div className={`p-2 rounded-xl bg-${item.color}-100`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-800">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Riskometer */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mb-12">
          <Riskometer fund={fund} />
        </div>

        {/* Top Holdings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mb-12">
          <TopHoldings holdings={fund.top_holdings} date={fund.holdings_date} />
        </div>

        {/* Main content – AI sections with improved typography */}
        <div className="space-y-12">
          {[
            { title: 'Overview', content: fund.overview, component: AIOverview },
            { title: 'Performance Analysis', content: fund.analysis, component: AIAnalysis },
          ].map((section, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 transition-all">
              <div className="prose prose-lg prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-slate-800
                prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:text-slate-900
                prose-li:my-2
                prose-table:border prose-table:border-gray-200
                prose-th:bg-gray-100 prose-th:p-3
                prose-td:p-3
              ">
                {section.component === AIOverview ? (
                  <AIOverview content={section.content} fundName={fund.scheme_name} />
                ) : (
                  <AIAnalysis content={section.content} />
                )}
              </div>
            </div>
          ))}

          {/* Who Should Invest */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-600" />
              Who Should Invest?
            </h2>
            <div className="prose prose-lg prose-slate max-w-none prose-p:text-gray-700 prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: fund.future_outlook || '' }}
            />
          </div>

          {/* Pros & Cons */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8">
            <ProsCons content={fund.pros_cons} />
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mt-12 mb-12 overflow-x-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Returns Analysis</h2>
          <ReturnsTable fund={fund} />
        </div>

        {/* SIP Calculator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mb-12">
          <SIPCalculator fund={fund} />
        </div>

        {/* FAQ */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
          <FAQSection content={fund.faq} />
        </div>

        {/* Related Funds */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Similar Funds</h2>
          <RelatedFunds fund={fund} />
        </div>

        {/* Comparison Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Compare with Peers</h2>
          <ComparisonLinks fund={fund} />
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl border border-amber-200 p-6 flex flex-col sm:flex-row gap-4 items-start">
          <ShieldAlert className="w-8 h-8 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-amber-800">Disclaimer</h3>
            <p className="text-sm text-amber-700 mt-1">
              Mutual fund investments are subject to market risks. Please read all scheme‑related documents carefully before investing. Past performance does not guarantee future returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
