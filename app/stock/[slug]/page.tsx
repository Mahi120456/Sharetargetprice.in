import { notFound } from "next/navigation";
import { Metadata } from "next";
import StockPageClient from "./StockPageClient";
import StocksCsvClient from "@/components/StocksCsvClient";
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

// ========== CSV HELPERS ==========
function toNumber(value: any): number | null {
  if (!value || value === 'N/A') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function getCsvTargets(row: any) {
  const years = [2025, 2026, 2027, 2028, 2030, 2035, 2040, 2045, 2050];
  const targets: Record<number, string> = {};
  for (const y of years) {
    const val = row[`target_${y}`];
    if (val && val !== 'N/A') {
      const num = toNumber(val);
      targets[y] = num ? `₹${num.toLocaleString('en-IN')}` : val;
    } else {
      targets[y] = 'N/A';
    }
  }
  return targets;
}

function mapCsvToStock(row: any) {
  return {
    name: row.name || row.symbol,
    symbol: row.symbol,
    current_price: toNumber(row.current_price),
    pe_ratio: toNumber(row.pe_ratio),
    eps: toNumber(row.eps),
    roe: toNumber(row.roe),
    roce: toNumber(row.roce),
    debt_to_equity: toNumber(row.debt_to_equity),
    promoter_holding: toNumber(row.promoter_holding),
    fii_holding: toNumber(row.fii_holding),
    dii_holding: toNumber(row.dii_holding),
    retail_holding: toNumber(row.retail_holding),
    market_cap: toNumber(row.market_cap),
    sector: row.sector,
    industry: row.industry,
    book_value: toNumber(row.book_value),
    net_profit_margin: toNumber(row.net_profit_margin),
    operating_margin: toNumber(row.operating_margin),
    roa: toNumber(row.roa),
    target_2025: row.target_2025,
    target_2026: row.target_2026,
    target_2027: row.target_2027,
    target_2028: row.target_2028,
    target_2030: row.target_2030,
    target_2035: row.target_2035,
    target_2040: row.target_2040,
    target_2045: row.target_2045,
    target_2050: row.target_2050,
  };
}

async function getCsvStock(symbol: string) {
  const { data, error } = await supabase
    .from('stocks_csv_data')
    .select('*')
    .eq('symbol', symbol.toUpperCase())
    .single();
  if (error || !data) return null;
  return mapCsvToStock(data);
}

// ========== EXISTING getStock (unchanged) ==========
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

// ========== FALLBACK: try existing then CSV ==========
async function getStockWithFallback(slug: string) {
  const existing = await getStock(slug);
  if (existing) return { source: 'existing', data: existing };

  const symbolPart = slug.split('-share-price-target')[0];
  if (symbolPart) {
    const csvStock = await getCsvStock(symbolPart);
    if (csvStock) return { source: 'csv', data: csvStock };
  }
  return null;
}

// ========== generateStaticParams (fixed Set spread issue) ==========
export async function generateStaticParams() {
  // Existing slugs
  const { data: existingStocks } = await supabase.from('stocks').select('slug');
  const existingSlugs = existingStocks?.map((s: any) => s.slug) || [];

  // CSV slugs
  const { data: csvStocks } = await supabase.from('stocks_csv_data').select('symbol');
  const csvSlugs = (csvStocks || []).map(
    (row) => `${row.symbol.toLowerCase()}-share-price-target-2026-to-2050`
  );

  // Fix: use Array.from instead of spread operator on Set
  const allSlugs = Array.from(new Set([...existingSlugs, ...csvSlugs]));
  return allSlugs.map((slug) => ({ slug }));
}

// ========== generateMetadata ==========
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getStockWithFallback(params.slug);
  if (!result) return { title: 'Stock Not Found' };

  if (result.source === 'existing') {
    const stock = result.data;
    return {
      title: `${stock.name} Share Price Target 2026-2050 | Analysis & Forecast`,
      description: `Get detailed ${stock.name} share price targets for 2026-2050.`,
      alternates: { canonical: `https://sharetargetprice.in/stock/${params.slug}` },
      openGraph: {
        title: `${stock.name} Share Price Target 2026-2050`,
        description: `Check ${stock.name} long-term price targets and analysis.`,
        images: [{ url: 'https://sharetargetprice.in/og-image.jpg' }],
      },
    };
  } else {
    const stock = result.data;
    return {
      title: `${stock.name} Share Price Target 2026-2050 | Key Financials`,
      description: `Check ${stock.name} share price targets, PE, ROE, and other key metrics.`,
      alternates: { canonical: `https://sharetargetprice.in/stock/${params.slug}` },
    };
  }
}

// ========== MAIN PAGE ==========
export default async function Page({ params }: PageProps) {
  const result = await getStockWithFallback(params.slug);
  if (!result) notFound();

  // ----- Existing stock (with full FMP features) -----
  if (result.source === 'existing') {
    const stock = result.data;
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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

  // ----- CSV stock (simpler UI) -----
  else {
    const stock = result.data;
    const basePrice = stock.current_price || 100;
    // Need original row for targets – re-fetch raw row
    const { data: rawCsv } = await supabase
      .from('stocks_csv_data')
      .select('*')
      .eq('symbol', stock.symbol)
      .single();
    const targets = getCsvTargets(rawCsv);
    const years = [2026, 2027, 2028, 2030, 2035, 2040, 2050];

    return (
      <StocksCsvClient
        stock={stock}
        basePrice={basePrice}
        targets={targets}
        years={years}
        symbol={stock.symbol}
      />
    );
  }
}
