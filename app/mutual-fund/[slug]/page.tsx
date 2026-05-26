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

// ISR: revalidate every 24 hours
export const revalidate = 86400;

// Generate all 500 fund slugs at build time
export async function generateStaticParams() {
  const supabase = createClient();
  const { data: funds } = await supabase
    .from('mutual_funds')
    .select('slug')
    .not('slug', 'is', null);
  
  return funds?.map((fund) => ({ slug: fund.slug })) || [];
}

async function getFundData(slug: string) {
  const supabase = createClient();
  const { data: fund, error } = await supabase
    .from('mutual_funds')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !fund) return null;
  return fund;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const fund = await getFundData(params.slug);
  if (!fund) return { title: 'Not Found' };
  
  return {
    title: fund.seo_title || `${fund.scheme_name} - Review, Returns, NAV, AUM`,
    description: fund.seo_description,
    keywords: fund.keywords,
    openGraph: {
      title: fund.seo_title,
      description: fund.seo_description,
      type: 'website',
    },
    alternates: {
      canonical: `https://sharetargetprice.in/mutual-fund/${fund.slug}`,
    },
  };
}

export default async function MutualFundPage({ params }: { params: { slug: string } }) {
  const fund = await getFundData(params.slug);
  if (!fund) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <FundHero fund={fund} />
      
      {/* Fund Snapshot (AUM, NAV, Expense Ratio etc.) */}
      <FundSnapshot fund={fund} />
      
      {/* Returns Table (1Y,3Y,5Y, since launch + benchmark) */}
      <ReturnsTable fund={fund} />
      
      {/* SIP Calculator (custom component) */}
      <SIPCalculator fund={fund} />
      
      {/* Top Holdings (10 stocks with %) */}
      <TopHoldings holdings={fund.top_holdings} date={fund.holdings_date} />
      
      {/* Riskometer + Volatility */}
      <Riskometer fund={fund} />
      
      {/* AI Generated Sections (if content present, else fallback) */}
      <AIOverview content={fund.overview} fundName={fund.scheme_name} />
      <AIAnalysis content={fund.analysis} />
      
      {/* Who Should Invest / Future Outlook */}
      <section className="my-8">
        <h2 className="text-2xl font-bold mb-4">Who Should Invest?</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: fund.future_outlook || '' }} />
      </section>
      
      {/* Pros & Cons */}
      <ProsCons content={fund.pros_cons} />
      
      {/* FAQs with Schema */}
      <FAQSection content={fund.faq} />
      
      {/* Related Funds (same category, same AMC) */}
      <RelatedFunds fund={fund} />
      
      {/* Comparison Links (top 3 competitors) */}
      <ComparisonLinks fund={fund} />
    </div>
  );
}
