import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import StocksCsvClient from '@/components/StocksCsvClient';

function toNumber(value: any): number | null {
  if (!value || value === 'N/A') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function getTargets(row: any) {
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
    slug: row.slug || `${row.symbol}-share-price-target`,
    sector: row.sector,
    industry: row.industry,
    current_price: toNumber(row.current_price),
    pe_ratio: toNumber(row.pe_ratio),
    roe: toNumber(row.roe),
    debt_to_equity: toNumber(row.debt_to_equity),
    promoter_holding: toNumber(row.promoter_holding),
    market_cap: toNumber(row.market_cap),
    target_2025: row.target_2025,
    target_2026: row.target_2026,
    target_2027: row.target_2027,
    target_2028: row.target_2028,
    target_2030: row.target_2030,
    target_2035: row.target_2035,
    target_2040: row.target_2040,
    target_2045: row.target_2045,
    target_2050: row.target_2050,
    content: null,
    shareholding: [],
    quarterlyData: [],
    events: [],
    mutualFunds: [],
    similarStocks: [],
    eps: toNumber(row.eps),
    book_value: toNumber(row.book_value),
    roce: toNumber(row.roce),
    roa: toNumber(row.roa),
    net_profit_margin: toNumber(row.net_profit_margin),
    operating_margin: toNumber(row.operating_margin),
  };
}

export async function generateStaticParams() {
  const { data } = await supabase.from('stocks_csv_data').select('symbol');
  return (data ?? []).map((row) => ({ symbol: row.symbol }));
}

export async function generateMetadata({ params }: { params: { symbol: string } }) {
  const { data } = await supabase
    .from('stocks_csv_data')
    .select('name, meta_title, meta_description')
    .eq('symbol', params.symbol)
    .single();
  if (!data) return { title: `${params.symbol} Stock Analysis` };
  return {
    title: data.meta_title || `${data.name} Share Price Target`,
    description: data.meta_description || `Check ${data.name} share price targets & key financials.`,
  };
}

export default async function Page({ params }: { params: { symbol: string } }) {
  const { data } = await supabase
    .from('stocks_csv_data')
    .select('*')
    .eq('symbol', params.symbol)
    .single();
  if (!data) notFound();

  const stock = mapCsvToStock(data);
  const basePrice = stock.current_price || 100;
  const targets = getTargets(data);
  const years = [2026, 2027, 2028, 2030, 2035, 2040, 2050];

  return <StocksCsvClient stock={stock} basePrice={basePrice} targets={targets} years={years} symbol={params.symbol} />;
}
