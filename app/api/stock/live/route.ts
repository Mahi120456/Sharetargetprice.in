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
    // Use 2 years range to ensure 1Y performance data available
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2y`;
    const chartRes = await fetch(chartUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!chartRes.ok) throw new Error(`Yahoo chart error: ${chartRes.status}`);
    const chartJson = await chartRes.json();
    const result = chartJson.chart?.result?.[0];
    if (!result) throw new Error('No chart data');

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    const closes = quote?.close || [];

    // --- Live data from meta (most reliable) ---
    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    // Use regularMarket fields; if missing, fallback to quote first value (but that's intraday)
    // For open: prefer regularMarketOpen, else try quote.open[0] (which is today's open)
    let open = meta.regularMarketOpen ?? null;
    if (open === null && quote?.open?.[0]) open = quote.open[0];
    const high = meta.regularMarketDayHigh ?? quote?.high?.[0] ?? null;
    const low = meta.regularMarketDayLow ?? quote?.low?.[0] ?? null;
    const volume = meta.regularMarketVolume ?? quote?.volume?.[0] ?? null;

    const high52 = meta.fiftyTwoWeekHigh;
    const low52 = meta.fiftyTwoWeekLow;

    // --- Market Cap: fetch from summary endpoint (more reliable) ---
    let marketCap = null;
    try {
      const summaryUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=price`;
      const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        const marketCapRaw = summaryJson?.quoteSummary?.result?.[0]?.price?.marketCap?.raw;
        if (marketCapRaw) marketCap = marketCapRaw;
      }
    } catch (e) { console.warn('Market cap fetch failed', e); }

    // Fallback: if still null, use meta.marketCap (if exists)
    if (!marketCap && meta.marketCap) marketCap = meta.marketCap;

    // --- Performance calculation (2 years of data ensures enough points) ---
    const current = price;
    const getHistoricalPrice = (daysAgo: number) => {
      if (closes.length < daysAgo + 1) return null;
      return closes[closes.length - daysAgo - 1];
    };
    const oneMonthPrice = getHistoricalPrice(22);
    const threeMonthPrice = getHistoricalPrice(66);
    const sixMonthPrice = getHistoricalPrice(132);
    const oneYearPrice = getHistoricalPrice(252); // 252 trading days

    const performance = {
      oneMonth: oneMonthPrice ? ((current - oneMonthPrice) / oneMonthPrice) * 100 : null,
      threeMonth: threeMonthPrice ? ((current - threeMonthPrice) / threeMonthPrice) * 100 : null,
      sixMonth: sixMonthPrice ? ((current - sixMonthPrice) / sixMonthPrice) * 100 : null,
      oneYear: oneYearPrice ? ((current - oneYearPrice) / oneYearPrice) * 100 : null,
    };

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
