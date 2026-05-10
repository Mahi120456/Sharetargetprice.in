export const dynamic = 'force-dynamic';
export const dynamicParams = true; // Isse naye slugs database se uthaye jayenge
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import StockHero from "@/components/StockHero";
import TradingViewChart from "@/components/TradingViewChart";
import NewsCarousel from "@/components/NewsCarousel";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

// 1. SEO Metadata (Dynamic Fetch)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cleanSlug = params.slug.replace('-share-price-target', '');
  
  const { data: stock } = await supabase
    .from('stocks')
    .select('name')
    .eq('slug', cleanSlug)
    .single();

  const titleName = stock?.name || cleanSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${titleName} Share Price Target 2025-2050`,
    description: `Analysis for ${titleName}.`,
  };
}

// NOTE: generateStaticParams ko poora hata diya hai taaki 404 lock khul jaye.

export default async function Page({ params }: PageProps) {
  const cleanSlug = params.slug.replace('-share-price-target', '');

  const { data: stock, error } = await supabase
    .from('stocks')
    .select(`*, stock_keywords(*), stock_articles(*)`)
    .eq('slug', cleanSlug)
    .single();

  if (!stock || error) {
    return notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <StockHero name={stock.name} symbol={stock.symbol} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h2 className="text-2xl font-bold mb-4">{stock.name} Chart</h2>
            <div className="h-[500px] w-full">
               <TradingViewChart symbol={stock.symbol} />
            </div>
          </div>

          <article className="bg-white p-8 rounded-3xl border border-slate-200 prose max-w-none">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tight">
              {stock.name} Analysis
            </h2>
            <div dangerouslySetInnerHTML={{ __html: stock.content || `<p>Generating report...</p>` }} />
          </article>
        </div>

        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] sticky top-24">
            <h3 className="font-bold text-2xl text-orange-400 mb-6">Target Prices</h3>
            <div className="space-y-4">
              <p className="flex justify-between">2026: <span className="text-green-400 font-bold">₹{stock.target_2026 || '--'}</span></p>
              <p className="flex justify-between">2030: <span className="text-green-400 font-bold">₹{stock.target_2030 || '--'}</span></p>
            </div>
          </div>
          <NewsCarousel stock={stock.name} />
        </aside>
      </div>
    </main>
  );
}
