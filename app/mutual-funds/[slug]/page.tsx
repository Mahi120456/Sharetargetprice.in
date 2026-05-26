import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import FundHero from '@/components/mutual-fund/FundHero';
import FundSnapshot from '@/components/mutual-fund/FundSnapshot';
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
export const dynamicParams = true; // be safe

// ========== 1. Generate ALL 500 slugs from CSV (guaranteed) ==========
export async function generateStaticParams() {
  const slugs: { slug: string }[] = [];
  const filePath = path.join(process.cwd(), 'data', '500_mutual_funds_PHASE6_INSTITUTIONAL.csv');

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        let slug = row.scheme_name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (slug) slugs.push({ slug });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`✅ generateStaticParams: ${slugs.length} slugs generated from CSV`);
  return slugs;
}

// ========== 2. Fetch fund data – CSV fallback + Supabase override ==========
async function getFund(slug: string) {
  // First, read from CSV as fallback (guaranteed data)
  let fundData: any = null;
  const filePath = path.join(process.cwd(), 'data', '500_mutual_funds_PHASE6_INSTITUTIONAL.csv');

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        let rowSlug = row.scheme_name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (rowSlug === slug) {
          fundData = {
            scheme_name: row.scheme_name,
            fund_house: row.fund_house,
            category: row.category,
            sub_category: row.sub_category,
            nav: parseFloat(row.nav) || null,
            aum: parseFloat(row.aum) || null,
            expense_ratio: parseFloat(row.expense_ratio) || null,
            returns_1y: parseFloat(row.returns_1y) || null,
            returns_3y: parseFloat(row.returns_3y) || null,
            returns_5y: parseFloat(row.returns_5y) || null,
            returns_since_launch: parseFloat(row.returns_since_launch) || null,
            benchmark: row.benchmark,
            riskometer: row.riskometer,
            fund_manager: row.fund_manager,
            fund_manager_tenure: row.fund_manager_tenure,
            asset_allocation: row.asset_allocation,
            top_holdings: row.top_holdings,
            min_sip_amount: parseInt(row.min_sip_amount) || null,
            min_lumpsum: parseInt(row.min_lumpsum) || null,
            launch_date: row.launch_date,
            exit_load: row.exit_load,
            seo_title: row.seo_title,
            seo_description: row.seo_description,
            keywords: row.keywords,
            investment_objective: row.investment_objective,
            holdings_date: row.holdings_date,
            slug: rowSlug,
          };
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  if (!fundData) return null;

  // Then, try to override with live data from Supabase (if available)
  try {
    const { data: live, error } = await supabase
      .from('mutual_funds')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && live) {
      fundData = { ...fundData, ...live };
    }
  } catch (err) {
    console.error(`Supabase fetch failed for ${slug}, using CSV fallback`);
  }

  return fundData;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const fund = await getFund(params.slug);
  if (!fund) return { title: 'Not Found' };
  return {
    title: fund.seo_title,
    description: fund.seo_description,
    keywords: fund.keywords,
    alternates: { canonical: `https://sharetargetprice.in/mutual-funds/${fund.slug}` }, // use plural
  };
}

export default async function MutualFundPage({ params }: { params: { slug: string } }) {
  const fund = await getFund(params.slug);
  if (!fund) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <FundHero fund={fund} />
      <FundSnapshot fund={fund} />
      <ReturnsTable fund={fund} />
      <SIPCalculator fund={fund} />
      <TopHoldings holdings={fund.top_holdings} date={fund.holdings_date} />
      <Riskometer fund={fund} />
      <AIOverview content={fund.overview} fundName={fund.scheme_name} />
      <AIAnalysis content={fund.analysis} />
      <div className="my-8"><h2 className="text-2xl font-bold mb-4">Who Should Invest?</h2><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: fund.future_outlook || '' }} /></div>
      <ProsCons content={fund.pros_cons} />
      <FAQSection content={fund.faq} />
      <RelatedFunds fund={fund} />
      <ComparisonLinks fund={fund} />
    </div>
  );
}
