import { NextResponse } from 'next/server';

// Simple in-memory cache for 1 minute (to avoid hitting Yahoo too often)
let cache: {
  symbol: string;
  data: any;
  timestamp: number;
} | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol missing' }, { status: 400 });
  }

  // Normalize symbol (remove .NS if present, add .NS for NSE)
  symbol = symbol.toUpperCase().replace(/\.NS$/, '');
  const yahooSymbol = `${symbol}.NS`;

  // Check cache
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
    
    // Current price
    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    // Today's OHLC
    const open = quote?.open?.[0] || null;
    const high = quote?.high?.[0] || null;
    const low = quote?.low?.[0] || null;
    
    // 52-week range
    const high52 = meta.fiftyTwoWeekHigh;
    const low52 = meta.fiftyTwoWeekLow;
    
    // Volume
    const volume = quote?.volume?.[0] || null;
    
    // Market cap (might not always be present in chart endpoint, try to get from other endpoint? fallback to null)
    let marketCap = null;
    if (meta.marketCap) marketCap = meta.marketCap;
    
    // Historical closes for performance calculation
    const closes = quote?.close || [];
    const current = price;
    
    // Helper to get historical price at days ago
    const getHistoricalPrice = (daysAgo: number) => {
      if (closes.length < daysAgo + 1) return null;
      return closes[closes.length - daysAgo - 1];
    };
    
    // Calculate returns (approx based on daily closes)
    const oneMonthPrice = getHistoricalPrice(22);  // approx 22 trading days
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
    
    // Update cache
    cache = {
      symbol: yahooSymbol,
      data: stockData,
      timestamp: Date.now(),
    };
    
    return NextResponse.json(stockData, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error(`Live stock API error for ${symbol}:`, error);
    // Return fallback data to avoid breaking UI
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
    }, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}
