import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { ArrowLeft } from 'lucide-react';

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
    <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen font-sans">
      {/* Back button (optional) */}
      <div className="mb-4">
        <a
          href="/mutual-funds"
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition-colors bg-white border border-gray-200 hover:border-orange-200 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mutual Funds
        </a>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-7">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full">{fund.fund_house}</span>
            <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">{fund.category}</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium text-white ${
              fund.riskometer === 'Low' ? 'bg-green-500' :
              fund.riskometer === 'Moderate' ? 'bg-blue-500' :
              fund.riskometer === 'Moderately High' ? 'bg-orange-500' : 'bg-red-500'
            }`}>
              {fund.riskometer} Risk
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">{fund.scheme_name}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'NAV', value: `₹${fund.nav?.toFixed(2)}` },
              { label: 'AUM', value: formatAUM(fund.aum) },
              { label: 'Expense Ratio', value: `${fund.expense_ratio ?? 'N/A'}%` },
              { label: 'Min SIP', value: `₹${fund.min_sip_amount ?? '500'}` },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-xs text-gray-500">{m.label}</div>
                <div className="text-base font-semibold">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fund Snapshot Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: 'AUM', value: formatAUM(fund.aum) },
              { label: 'Expense Ratio', value: `${fund.expense_ratio ?? 'N/A'}%` },
              { label: 'Min SIP', value: `₹${fund.min_sip_amount ?? 'N/A'}` },
              { label: 'Min Lumpsum', value: `₹${fund.min_lumpsum ?? 'N/A'}` },
              { label: 'Launch Date', value: formatDate(fund.launch_date) },
              { label: 'Exit Load', value: fund.exit_load || 'Nil' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Riskometer Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-7">
          <Riskometer fund={fund} />
        </div>
      </div>

      {/* Top Holdings Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-7">
          <TopHoldings holdings={fund.top_holdings} date={fund.holdings_date} />
        </div>
      </div>

      {/* AI Sections – using post-content like stock page */}
      {fund.overview && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 md:p-7">
            <AIOverview content={fund.overview} />
          </div>
        </div>
      )}
      {fund.analysis && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 md:p-7">
            <AIAnalysis content={fund.analysis} />
          </div>
        </div>
      )}
      {fund.future_outlook && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 md:p-7">
            <div className="post-content" dangerouslySetInnerHTML={{ __html: fund.future_outlook }} />
          </div>
        </div>
      )}
      {fund.pros_cons && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 md:p-7">
            <ProsCons content={fund.pros_cons} />
          </div>
        </div>
      )}

      {/* Returns Table Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-7 overflow-x-auto">
          <ReturnsTable fund={fund} />
        </div>
      </div>

      {/* SIP Calculator Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-7">
          <SIPCalculator fund={fund} />
        </div>
      </div>

      {/* FAQ Card */}
      {fund.faq && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 md:p-7">
            <FAQSection content={fund.faq} />
          </div>
        </div>
      )}

      {/* Related Funds Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-7">
          <RelatedFunds fund={fund} />
        </div>
      </div>

      {/* Comparison Links Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-7">
          <ComparisonLinks fund={fund} />
        </div>
      </div>

      {/* Disclaimer Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p><strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Please read all scheme‑related documents carefully before investing. Past performance does not guarantee future returns.</p>
      </div>
    </main>
  );
}
