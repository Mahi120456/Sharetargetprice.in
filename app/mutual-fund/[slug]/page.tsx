import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FundPageClient from "./FundPageClient";

interface PageProps {
  params: { slug: string };
}

async function getFund(slug: string) {
  const { data, error } = await supabase
    .from('mutual_funds')
    .select('*')
    .eq('slug', slug)
    .single();
  return error || !data ? null : data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const fund = await getFund(params.slug);
  if (!fund) return { title: 'Fund Not Found' };
  return {
    title: fund.seo_title || `${fund.scheme_name} – NAV, Returns & Analysis`,
    description: fund.seo_description || `Get detailed analysis of ${fund.scheme_name}. View latest NAV, returns (1Y/3Y/5Y), AUM, expense ratio, and riskometer.`,
  };
}

export default async function MutualFundPage({ params }: PageProps) {
  const fund = await getFund(params.slug);
  if (!fund) notFound();
  
  return <FundPageClient fund={fund} />;
}
