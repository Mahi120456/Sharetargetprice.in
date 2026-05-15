import { NextResponse } from 'next/server';

let cache: { symbol: string; data: any; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get('symbol');
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol missing' }, { status: 400 });
  }

  symbol = symbol.toUpperCase().replace(/\.NS$/, '');
  const yahooSymbol = `${symbol}.NS`;

  if (cache && cache.symbol === yahooSymbol && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // 1️⃣ Fetch TODAY's intraday data (range=1d) – gives correct open/high/low/prev close
    const todayUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    const todayRes = await fetch(todayUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!todayRes.ok) throw new Error(`Today data error: ${todayRes.status}`);
    const todayJson = await todayRes.json();
    const todayResult = todayJson.chart?.result?.[0];
    if (!todayResult) throw new Error('No today data');

    const meta = todayResult.meta;
    const quoteToday = todayResult.indicators?.quote?.[0];

    // Today's live price & change
    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    // Today's open, high, low – prefer meta fields, else from quote array (which for 1d range is correct)
    const open = meta.regularMarketOpen ?? quoteToday?.open?.[0] ?? null;
    const high = meta.regularMarketDayHigh ?? quoteToday?.high?.[0] ?? null;
    const low = meta.regularMarketDayLow ?? quoteToday?.low?.[0] ?? null;
    const volume = meta.regularMarketVolume ?? quoteToday?.volume?.[0] ?? null;
    const high52 = meta.fiftyTwoWeekHigh;
    const low52 = meta.fiftyTwoWeekLow;

    // 2️⃣ Fetch 2y data for performance (closing prices only)
    const perfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2y`;
    const perfRes = await fetch(perfUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    let performance: {
      oneMonth: number | null;
      threeMonth: number | null;
      sixMonth: number | null;
      oneYear: number | null;
    } = {
      oneMonth: null,
      threeMonth: null,
      sixMonth: null,
      oneYear: null,
    };
    if (perfRes.ok) {
      const perfJson = await perfRes.json();
      const closes = perfJson.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
      const current = price;
      const getPrice = (daysAgo: number) => closes[closes.length - 1 - daysAgo];
      if (closes.length > 22) performance.oneMonth = ((current - getPrice(22)) / getPrice(22)) * 100;
      if (closes.length > 66) performance.threeMonth = ((current - getPrice(66)) / getPrice(66)) * 100;
      if (closes.length > 132) performance.sixMonth = ((current - getPrice(132)) / getPrice(132)) * 100;
      if (closes.length > 252) performance.oneYear = ((current - getPrice(252)) / getPrice(252)) * 100;
    }

    // 3️⃣ Market Cap from quoteSummary (reliable)
    let marketCap = null;
    try {
      const summaryUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=price`;
      const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        marketCap = summaryJson?.quoteSummary?.result?.[0]?.price?.marketCap?.raw;
      }
    } catch (e) { console.warn('Market cap fetch failed', e); }

    // Fallback to meta.marketCap if still null
    if (!marketCap && meta.marketCap) marketCap = meta.marketCap;

    const stockData = {
      symbol: meta.symbol || symbol,
      price,
      change,
      changePercent,
      open,
      high,
      low,
      prevClose: previousClose,
      volume,
      high52,
      low52,
      marketCap,
      performance,
      lastUpdated: new Date().toISOString(),
    };

    cache = { symbol: yahooSymbol, data: stockData, timestamp: Date.now() };
    return NextResponse.json(stockData, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=30' },
    });
  } catch (error) {
    console.error(`Live API error for ${symbol}:`, error);
    return NextResponse.json({
      symbol, price: null, change: null, changePercent: null,
      open: null, high: null, low: null, prevClose: null,
      volume: null, high52: null, low52: null, marketCap: null,
      performance: { oneMonth: null, threeMonth: null, sixMonth: null, oneYear: null },
      lastUpdated: null,
    });
  }
}
