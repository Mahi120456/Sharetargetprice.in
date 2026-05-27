import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, Shield, PieChart, DollarSign, Calendar, Clock } from 'lucide-react';

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

// Generate slugs from CSV
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
  console.log(`✅ generateStaticParams: ${slugs.length} slugs`);
  return slugs;
}

// Fetch fund data from Supabase
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

// Helper to format AUM in Crores
function formatAUM(aum: number) {
  if (!aum) return 'N/A';
  if (aum >= 10000) return `${(aum / 10000).toFixed(2)} Lac Cr`;
  return `${aum.toFixed(2)} Cr`;
}

// Helper to format date
function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function MutualFundPage({ params }: { params: { slug: string } }) {
  const fund = await getFund(params.slug);
  if (!fund) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* 1. Title - Smaller heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
          {fund.scheme_name}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>{fund.fund_house}</span>
          <span>•</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">{fund.category}</span>
          <span>•</span>
          <span className={`px-2 py-0.5 rounded-full text-white text-xs ${
            fund.riskometer === 'Low' ? 'bg-green-500' :
            fund.riskometer === 'Moderate' ? 'bg-blue-500' :
            fund.riskometer === 'Moderately High' ? 'bg-orange-500' :
            'bg-red-500'
          }`}>
            {fund.riskometer}
          </span>
        </div>

        {/* 2. Thumbnail */}
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-md">
          <Image
            src="/mutual-fund-placeholder.jpg"
            alt={fund.scheme_name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div className="text-white">
              <div className="text-sm opacity-90">Current NAV</div>
              <div className="text-3xl font-bold">₹{fund.nav?.toFixed(2)}</div>
              <div className="text-xs opacity-75">as of {new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* 3. Fund Details Vertical List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">AUM</div>
                <div className="font-semibold">{formatAUM(fund.aum)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Expense Ratio</div>
                <div className="font-semibold">{fund.expense_ratio ?? 'N/A'}%</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Min SIP</div>
                <div className="font-semibold">₹{fund.min_sip_amount ?? 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Min Lumpsum</div>
                <div className="font-semibold">₹{fund.min_lumpsum ?? 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Launch Date</div>
                <div className="font-semibold">{formatDate(fund.launch_date)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Exit Load</div>
                <div className="font-semibold">{fund.exit_load || 'Nil'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Riskometer */}
        <div className="mb-8">
          <Riskometer fund={fund} />
        </div>

        {/* 5. Top Holdings */}
        <div className="mb-8">
          <TopHoldings holdings={fund.top_holdings} date={fund.holdings_date} />
        </div>

        {/* 6. Full Article (AI generated sections) */}
        <div className="space-y-10 mb-8">
          <AIOverview content={fund.overview} fundName={fund.scheme_name} />
          <AIAnalysis content={fund.analysis} />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Who Should Invest?</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: fund.future_outlook || '' }} />
          </div>
          <ProsCons content={fund.pros_cons} />
        </div>

        {/* 7. FAQ */}
        <div className="mb-8">
          <FAQSection content={fund.faq} />
        </div>

        {/* 8. Returns Table */}
        <div className="mb-8">
          <ReturnsTable fund={fund} />
        </div>

        {/* 9. SIP Calculator */}
        <div className="mb-8">
          <SIPCalculator fund={fund} />
        </div>

        {/* 10. Related Funds */}
        <div className="mb-8">
          <RelatedFunds fund={fund} />
        </div>

        {/* 11. Compare with Similar Funds */}
        <div className="mb-8">
          <ComparisonLinks fund={fund} />
        </div>
      </div>
    </div>
  );
}
