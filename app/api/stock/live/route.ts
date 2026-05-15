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
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1y`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    
    if (!res.ok) throw new Error(`Yahoo API error: ${res.status}`);
    
    const data = await res.json();
    const result = data.chart?.result?.[0];
    
    if (!result) throw new Error('No data returned');

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    
    // Current price & change
    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    // 🔥 FIXED: Use regularMarket fields from meta (most reliable for intraday)
    const open = meta.regularMarketOpen ?? quote?.open?.[0] ?? null;
    const high = meta.regularMarketDayHigh ?? quote?.high?.[0] ?? null;
    const low = meta.regularMarketDayLow ?? quote?.low?.[0] ?? null;
    
    // 52-week range
    const high52 = meta.fiftyTwoWeekHigh;
    const low52 = meta.fiftyTwoWeekLow;
    
    // Volume
    const volume = meta.regularMarketVolume ?? quote?.volume?.[0] ?? null;
    
    // Market cap
    const marketCap = meta.marketCap ?? null;
    
    // Historical closes for performance (using quote.close array)
    const closes = quote?.close || [];
    const current = price;
    
    const getHistoricalPrice = (daysAgo: number) => {
      if (closes.length < daysAgo + 1) return null;
      return closes[closes.length - daysAgo - 1];
    };
    
    const oneMonthPrice = getHistoricalPrice(22);
    const threeMonthPrice = getHistoricalPrice(66);
    const sixMonthPrice = getHistoricalPrice(132);
    const oneYearPrice = getHistoricalPrice(252);
    
    const performance = {
      oneMonth: oneMonthPrice ? ((current - oneMonthPrice) / oneMonthPrice) * 100 : null,
      threeMonth: threeMonthPrice ? ((current - threeMonthPrice) / threeMonthPrice) * 100 : null,
      sixMonth: sixMonthPrice ? ((current - sixMonthPrice) / sixMonthPrice) * 100 : null,
      oneYear: oneYearPrice ? ((current - oneYearPrice) / oneYearPrice) * 100 : null,
    };
    
    const stockData = {
      symbol: meta.symbol || symbol,
      price: price,
      change: change,
      changePercent: changePercent,
      open: open,
      high: high,
      low: low,
      prevClose: previousClose,
      volume: volume,
      high52: high52,
      low52: low52,
      marketCap: marketCap,
      performance: performance,
      lastUpdated: new Date().toISOString(),
    };
    
    cache = { symbol: yahooSymbol, data: stockData, timestamp: Date.now() };
    
    return NextResponse.json(stockData, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error(`Live stock API error for ${symbol}:`, error);
    return NextResponse.json({
      symbol: symbol,
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
