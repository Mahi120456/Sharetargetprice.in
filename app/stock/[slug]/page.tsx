import { notFound } from "next/navigation";
import { Metadata } from "next";
import StockPageClient from "./StockPageClient";
import { supabase } from "@/lib/supabase";
import { updateStockPerformance } from "@/lib/updateStockPerformance";
import { 
  getTechnicalData,
  getShareholding,
  getQuarterlyIncome,
  getEvents,
  getTopMutualFunds,
  getSimilarStocks
} from "@/lib/fmp";
import { getAuthorBySlug } from "@/data/authors";

interface PageProps {
  params: { slug: string };
}

// Get stock with caching + auto update
async function getStock(slug: string) {
  const cleanSlug = slug.split('-share-price-target')[0];

  let { data, error } = await supabase
    .from('stocks')
    .select('*, stock_keywords(*)')
    .eq('slug', slug)
    .single();

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

  // Caching logic (1 hour)
  const lastUpdated = new Date(data.last_updated);
  const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

  if (hoursSinceUpdate > 1) {
    await updateStockPerformance(data.slug, data.symbol);

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

  // Fetch all FMP data in parallel
  const [
    technicalData,
    shareholding,
    quarterly,
    events,
    mutualFunds,
    similarStocks
  ] = await Promise.all([
    getTechnicalData(stock.symbol),
    getShareholding(stock.symbol),
    getQuarterlyIncome(stock.symbol),
    getEvents(stock.symbol),
    getTopMutualFunds(stock.symbol),
    getSimilarStocks(stock.symbol)
  ]);

  // Fetch author from JSON
  const author = getAuthorBySlug('mahendra-maurya');

  // ========== FETCH 5 RELATED STOCKS FOR INTERLINKING ==========
  let relatedStocksData: any = {
    sectorTop: null,
    industryHigh: null,
    randomSector: null,
    similarPe: null,
    sectorLeaderAlt: null,
  };

  // 1. Same sector top stock (highest market cap)
  if (stock.sector) {
    const { data: sectorTop } = await supabase
      .from('stocks')
      .select('slug, name, symbol, current_price')
      .eq('sector', stock.sector)
      .neq('slug', stock.slug)
      .order('market_cap', { ascending: false })
      .limit(1);
    relatedStocksData.sectorTop = sectorTop?.[0] || null;
  }

  // 2. Same industry high market cap (if industry exists)
  if (stock.industry) {
    const { data: industryHigh } = await supabase
      .from('stocks')
      .select('slug, name, symbol, current_price')
      .eq('industry', stock.industry)
      .neq('slug', stock.slug)
      .order('market_cap', { ascending: false })
      .limit(1);
    relatedStocksData.industryHigh = industryHigh?.[0] || null;
  }

  // 3. Random stock from same sector (different from sectorTop)
  if (stock.sector && relatedStocksData.sectorTop) {
    const { data: randomSector } = await supabase
      .from('stocks')
      .select('slug, name, symbol, current_price')
      .eq('sector', stock.sector)
      .neq('slug', stock.slug)
      .neq('slug', relatedStocksData.sectorTop.slug)
      .order('market_cap', { ascending: false })
      .limit(1);
    relatedStocksData.randomSector = randomSector?.[0] || null;
  } else if (stock.sector) {
    const { data: anyStock } = await supabase
      .from('stocks')
      .select('slug, name, symbol, current_price')
      .eq('sector', stock.sector)
      .neq('slug', stock.slug)
      .limit(1);
    relatedStocksData.randomSector = anyStock?.[0] || null;
  }

  // 4. Similar P/E ratio stock (within 20% range)
  if (stock.pe_ratio && typeof stock.pe_ratio === 'number') {
    const minPe = stock.pe_ratio * 0.8;
    const maxPe = stock.pe_ratio * 1.2;
    const { data: similarPe } = await supabase
      .from('stocks')
      .select('slug, name, symbol, current_price')
      .gte('pe_ratio', minPe)
      .lte('pe_ratio', maxPe)
      .neq('slug', stock.slug)
      .limit(1);
    relatedStocksData.similarPe = similarPe?.[0] || null;
  }

  // 5. Another sector leader (second highest market cap)
  if (stock.sector) {
    const { data: sectorLeaders } = await supabase
      .from('stocks')
      .select('slug, name, symbol, current_price')
      .eq('sector', stock.sector)
      .neq('slug', stock.slug)
      .order('market_cap', { ascending: false })
      .limit(2);
    if (sectorLeaders && sectorLeaders.length > 1) {
      relatedStocksData.sectorLeaderAlt = sectorLeaders[1];
    } else if (sectorLeaders && sectorLeaders.length === 1 && sectorLeaders[0].slug !== relatedStocksData.sectorTop?.slug) {
      relatedStocksData.sectorLeaderAlt = sectorLeaders[0];
    }
  }
  // ========== END RELATED STOCKS ==========

  const getTarget = (year: number, multiplier: number) => {
    if (stock[`target_${year}`]) return stock[`target_${year}`];
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
        technicalData={technicalData}
        shareholding={shareholding}
        quarterlyData={quarterly}
        events={events}
        mutualFunds={mutualFunds}
        similarStocks={similarStocks}
        author={author}
        relatedStocksData={relatedStocksData}
      />
    </>
  );
}
