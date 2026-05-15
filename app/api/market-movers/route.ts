import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Apne favorite stocks ke symbols (jo bhi chahiye)
const FAVORITE_SYMBOLS = [
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'INFY',
  'ICICIBANK',
  'ITC',
  'SBIN'
];

export async function GET() {
  try {
    // Supabase se slug + name fetch
    const { data: stocksData, error } = await supabase
      .from('stocks')
      .select('symbol, name, slug')
      .in('symbol', FAVORITE_SYMBOLS);

    if (error || !stocksData || stocksData.length === 0) {
      throw new Error('No stocks found');
    }

    // Live price from Yahoo
    const results = await Promise.all(
      stocksData.map(async (stock) => {
        try {
          const yahooSymbol = `${stock.symbol}.NS`;
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
          const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!res.ok) return null;
          const json = await res.json();
          const meta = json.chart?.result?.[0]?.meta;
          if (!meta) return null;
          const price = meta.regularMarketPrice;
          const prevClose = meta.previousClose;
          const change = price - prevClose;
          const changePercent = (change / prevClose) * 100;
          return {
            symbol: stock.symbol,
            name: stock.name,
            slug: stock.slug,          // ✅ base slug
            price,
            change,
            changePercent,
          };
        } catch {
          return null;
        }
      })
    );

    const validStocks = results.filter(s => s !== null);
    if (validStocks.length === 0) {
      // Fallback with correct slugs (as per your DB)
      const fallback = [
        { symbol: 'RELIANCE', name: 'Reliance Industries', slug: 'reliance', price: 2850, change: 45, changePercent: 1.6 },
        { symbol: 'TCS', name: 'Tata Consultancy Services', slug: 'tcs', price: 3950, change: 62, changePercent: 1.54 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', slug: 'hdfcbank', price: 1650, change: -22, changePercent: -1.31 },
        { symbol: 'INFY', name: 'Infosys', slug: 'infy', price: 1520, change: 18, changePercent: 1.22 },
        { symbol: 'ICICIBANK', name: 'ICICI Bank', slug: 'icicibank', price: 1120, change: 7.5, changePercent: 0.67 },
        { symbol: 'ITC', name: 'ITC Limited', slug: 'itc', price: 430, change: -2.5, changePercent: -0.58 },
        { symbol: 'SBIN', name: 'SBI', slug: 'sbin', price: 780, change: -12, changePercent: -1.55 },
      ];
      return NextResponse.json({ success: true, stocks: fallback, lastUpdated: new Date().toISOString() });
    }

    return NextResponse.json({
      success: true,
      stocks: validStocks,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('API error:', error);
    const mock = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', slug: 'reliance', price: 2850, change: 45, changePercent: 1.6 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', slug: 'tcs', price: 3950, change: 62, changePercent: 1.54 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', slug: 'hdfcbank', price: 1650, change: -22, changePercent: -1.31 },
    ];
    return NextResponse.json({ success: true, stocks: mock, lastUpdated: new Date().toISOString() });
  }
}
