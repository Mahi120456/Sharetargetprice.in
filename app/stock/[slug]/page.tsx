import { notFound } from "next/navigation";
import { Metadata } from "next";
import StockPageClient from "./StockPageClient";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: { slug: string };
}

// ✅ Updated getStock with Caching Logic
async function getStock(slug: string) {
  const cleanSlug = slug.split('-share-price-target')[0];

  // Try original slug first
  let { data, error } = await supabase
    .from('stocks')
    .select('*, stock_keywords(*)')
    .eq('slug', slug)
    .single();

  // If not found, try cleaned slug
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

  // ✅ Caching Logic: Check if data is fresh (24 hours)
  const lastUpdated = new Date(data.last_updated);
  const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

  // Agar data 24 hours se purana hai to last_updated update kar do
  if (hoursSinceUpdate > 24) {
    await supabase
      .from('stocks')
      .update({ last_updated: new Date().toISOString() })
      .eq('slug', data.slug);
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
    description: `Get detailed ${stockName} share price targets for 2026, 2027, 2028, 2030, 2035, 2040, 2050. Based on fundamental analysis, earnings growth, and sector outlook.`,
    alternates: {
      canonical: `https://sharetargetprice.in/stock/${params.slug}`,
    },
    openGraph: {
      title: `${stockName} Share Price Target 2026-2050`,
      description: `Check ${stockName} long-term price targets and analysis.`,
      url: `https://sharetargetprice.in/stock/${params.slug}`,
      siteName: 'Share Target Price',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${stockName} Share Price Target - Share Target Price`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${stockName} Share Price Target`,
      description: `Long-term price targets and analysis for ${stockName}.`,
      images: [ogImageUrl],
    },
  };
}

// Main Page
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

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": stock.name,
    "description": `${stock.name} share price targets from 2026 to 2050.`,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": basePrice,
      "highPrice": parseInt(targets[2050].replace(/[^0-9]/g, '')) || basePrice * 20,
    },
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
