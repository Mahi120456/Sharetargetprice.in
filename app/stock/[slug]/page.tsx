import { notFound } from "next/navigation";
import { Metadata } from "next";
import StockPageClient from "./StockPageClient";
import { supabase } from "@/lib/supabase";
import { updateStockPerformance } from "@/lib/updateStockPerformance";

interface PageProps {
  params: { slug: string };
}

// Get stock with caching + auto update
async function getStock(slug: string) {
  const cleanSlug = slug.split('-share-price-target')[0];

  // Try original slug
  let { data, error } = await supabase
    .from('stocks')
    .select('*, stock_keywords(*)')
    .eq('slug', slug)
    .single();

  // Try cleaned slug if not found
  if (error || !data) {
    const result = await supabase
      .from('stocks')
      .select('*, stock_keywords(*)')
      .eq('slug', cleanSlug)
      .single();
    data = result.data;
    error = result.error;
  }

  if (error || !data) return null;

  // ✅ Check freshness (1 hour)
  const lastUpdated = new Date(data.last_updated);
  const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

  // Agar 1 ghante se purana hai to Yahoo se update karo
  if (hoursSinceUpdate > 1) {
    await updateStockPerformance(data.slug, data.symbol);
    
    // Dobara fresh data lo
    const { data: freshData } = await supabase
      .from('stocks')
      .select('*, stock_keywords(*)')
      .eq('slug', data.slug)
      .single();

    if (freshData) data = freshData;
  }

  return data;
}

// Dynamic Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stock = await getStock(params.slug);
  if (!stock) {
    return {
      title: 'Stock Not Found | Share Target Price',
      description: 'The requested stock analysis page could not be found.',
    };
  }

  const stockName = stock.name;
  const ogImageUrl = 'https://sharetargetprice.in/og-image.jpg';

  return {
    title: `${stockName} Share Price Target 2026-2050 | Analysis & Forecast`,
    description: `Get detailed ${stockName} share price targets for 2026, 2027, 2028, 2030, 2035, 2040, 2050.`,
    alternates: {
      canonical: `https://sharetargetprice.in/stock/${params.slug}`,
    },
    openGraph: {
      title: `${stockName} Share Price Target 2026-2050`,
      description: `Check ${stockName} long-term price targets and analysis.`,
      images: [{ url: ogImageUrl }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const stock = await getStock(params.slug);
  if (!stock) notFound();

  const basePrice = stock.current_price || 100;

  const getTarget = (year: number, multiplier: number) => {
    if (stock[`target_\( {year}`]) return stock[`target_ \){year}`];
    return `₹${Math.round(basePrice * multiplier).toLocaleString('en-IN')}`;
  };

  const targets = {
    2026: getTarget(2026, 1.35),
    2027: getTarget(2027, 1.60),
    2028: getTarget(2028, 1.90),
    2030: getTarget(2030, 2.50),
    2035: getTarget(2035, 4.50),
    2040: getTarget(2040, 8.00),
    2050: getTarget(2050, 20.00),
  };

  const years = [2026, 2027, 2028, 2030, 2035, 2040, 2050];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": stock.name,
    "description": `${stock.name} share price targets from 2026 to 2050.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StockPageClient
        stock={stock}
        basePrice={basePrice}
        targets={targets}
        years={years}
        errorMsg={null}
      />
    </>
  );
}
