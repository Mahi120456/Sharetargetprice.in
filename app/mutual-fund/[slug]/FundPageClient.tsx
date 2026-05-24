'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import FundHero from '@/components/FundHero';
import ReturnCalculator from '@/components/ReturnCalculator';
import HoldingsTable from '@/components/HoldingsTable';
import FundReturnsTable from '@/components/FundReturnsTable';
import FundDetailsCard from '@/components/FundDetailsCard';
import RelatedFunds from '@/components/RelatedFunds';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FundPageClient({ fund }: { fund: any }) {
  const router = useRouter();
  const [navData, setNavData] = useState<any>(null);
  const [relatedFunds, setRelatedFunds] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);

  // ✅ Fixed: rank as undefined instead of null
  const returnsData = [
    { period: '1Y', fundReturn: fund.returns_1y, categoryAvg: undefined, rank: undefined },
    { period: '3Y', fundReturn: fund.returns_3y, categoryAvg: undefined, rank: undefined },
    { period: '5Y', fundReturn: fund.returns_5y, categoryAvg: undefined, rank: undefined },
  ];

  useEffect(() => {
    fetch(`/api/mutual-fund/live?code=${fund.scheme_code}`)
      .then(res => res.json())
      .then(setNavData)
      .catch(console.error);

    async function fetchRelated() {
      const { data, error } = await supabase
        .from('mutual_funds')
        .select('slug, scheme_name, category, returns_3y, nav')
        .eq('category', fund.category)
        .neq('slug', fund.slug)
        .limit(6);
      if (!error && data) setRelatedFunds(data);
    }
    fetchRelated();
  }, [fund.scheme_code, fund.category, fund.slug]);

  return (
    <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen font-sans">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition-colors bg-white border border-gray-200 hover:border-orange-200 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <FundHero fund={fund} navData={navData} />
      <ReturnCalculator fundName={fund.scheme_name} nav={navData?.nav} />
      <HoldingsTable holdings={holdings} fundName={fund.scheme_name} />
      <FundReturnsTable returns={returnsData} fundName={fund.scheme_name} />
      <FundDetailsCard
        expenseRatio={fund.expense_ratio}
        exitLoad="Exit load of 1%, if redeemed within 15 days."
        stampDuty="0.005% (from July 1st, 2020)"
        taxImplication="If redeemed within 2 years: as per income tax slab. After 2 years: 12.5% LTCG."
        fundManagers={[]}
        fundHouse={fund.fund_house}
        launchDate={fund.launch_date}
        benchmark={fund.benchmark}
      />

      {fund.content && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: fund.content }} />
        </div>
      )}

      <RelatedFunds funds={relatedFunds} currentFundName={fund.scheme_name} category={fund.category} />

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        ⚠️ <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Read all scheme related documents carefully. Past performance is not indicative of future returns. This information is for educational purposes only.
      </div>
    </main>
  );
}
