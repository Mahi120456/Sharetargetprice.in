import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase.from('mutual_funds').select('slug');
  return data?.map((f) => ({ slug: f.slug })) || [];
}

async function getFund(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from('mutual_funds').select('*').eq('slug', slug).single();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const fund = await getFund(params.slug);
  if (!fund) return { title: 'Not Found' };
  return { title: fund.seo_title, description: fund.seo_description, keywords: fund.keywords, alternates: { canonical: `https://sharetargetprice.in/mutual-fund/${fund.slug}` } };
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
