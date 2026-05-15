import { NextResponse } from 'next/server';

let cache: { symbol: string; data: any; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get('symbol');
  if (!symbol) return NextResponse.json({ error: 'Symbol missing' }, { status: 400 });

  symbol = symbol.toUpperCase().replace(/\.NS$/, '');
  const yahooSymbol = `${symbol}.NS`;

  if (cache && cache.symbol === yahooSymbol && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // Step 1: Today's 1d data (for open, high, low, current price)
    const todayUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    const todayRes = await fetch(todayUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!todayRes.ok) throw new Error(`Today data error: ${todayRes.status}`);
    const todayJson = await todayRes.json();
    const todayResult = todayJson.chart?.result?.[0];
    if (!todayResult) throw new Error('No today data');

    const meta = todayResult.meta;
    const quoteToday = todayResult.indicators?.quote?.[0];

    const price = meta.regularMarketPrice;
    const open = meta.regularMarketOpen ?? quoteToday?.open?.[0] ?? null;
    const high = meta.regularMarketDayHigh ?? quoteToday?.high?.[0] ?? null;
    const low = meta.regularMarketDayLow ?? quoteToday?.low?.[0] ?? null;
    const volume = meta.regularMarketVolume ?? quoteToday?.volume?.[0] ?? null;
    const high52 = meta.fiftyTwoWeekHigh;
    const low52 = meta.fiftyTwoWeekLow;

    // Step 2: Historical 2y data (for reliable previous close + performance)
    const histUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2y`;
    const histRes = await fetch(histUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!histRes.ok) throw new Error(`History data error: ${histRes.status}`);
    const histJson = await histRes.json();
    const histResult = histJson.chart?.result?.[0];
    if (!histResult) throw new Error('No history data');

    const histMeta = histResult.meta;
    const histQuote = histResult.indicators?.quote?.[0];
    const closes = histQuote?.close || [];

    // 🔥 Previous close: use meta.previousClose if valid, else second-last close from array
    let previousClose = histMeta.previousClose;
    if (!previousClose || previousClose === 0) {
      if (closes.length >= 2) {
        previousClose = closes[closes.length - 2]; // previous trading day's close
      } else if (closes.length === 1) {
        previousClose = closes[0];
      }
    }

    // Calculate change & percent
    let change = null;
    let changePercent = null;
    if (price !== null && previousClose !== null && previousClose !== 0) {
      change = price - previousClose;
      changePercent = (change / previousClose) * 100;
    } else {
      change = histMeta.regularMarketChange ?? null;
      changePercent = histMeta.regularMarketChangePercent ?? null;
    }

    // Performance from same historical closes
    const current = price;
    const getPrice = (daysAgo: number) => closes[closes.length - 1 - daysAgo];
    const performance = {
      oneMonth: null as number | null,
      threeMonth: null as number | null,
      sixMonth: null as number | null,
      oneYear: null as number | null,
    };
    if (closes.length > 22) performance.oneMonth = ((current - getPrice(22)) / getPrice(22)) * 100;
    if (closes.length > 66) performance.threeMonth = ((current - getPrice(66)) / getPrice(66)) * 100;
    if (closes.length > 132) performance.sixMonth = ((current - getPrice(132)) / getPrice(132)) * 100;
    if (closes.length > 252) performance.oneYear = ((current - getPrice(252)) / getPrice(252)) * 100;

    // Market cap: quoteSummary first, then meta.marketCap
    let marketCap = null;
    try {
      const summaryUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=price`;
      const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        marketCap = summaryJson?.quoteSummary?.result?.[0]?.price?.marketCap?.raw;
      }
    } catch (e) {}
    if (!marketCap && histMeta.marketCap) marketCap = histMeta.marketCap;

    const stockData = {
      symbol: histMeta.symbol || symbol,
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
      symbol,
      price: null,
      change: null,
      changePercent: null,
      open: null,
      high: null,
      low: null,
      prevClose: null,
      volume: null,
      high52: null,
      low52: null,
      marketCap: null,
      performance: { oneMonth: null, threeMonth: null, sixMonth: null, oneYear: null },
      lastUpdated: null,
    });
  }
}
