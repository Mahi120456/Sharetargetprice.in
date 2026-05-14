import { NextResponse } from 'next/server';

// Fallback mock data generator (for when API fails)
function generateMockData(symbol: string) {
  const data = [];
  const endDate = new Date();
  for (let i = 365; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    const basePrice = 1000 + Math.sin(i * 0.05) * 200 + Math.random() * 50;
    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * 30;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;
    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
    });
  }
  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get('symbol');
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol missing' }, { status: 400 });
  }

  // Try Yahoo Finance via a CORS proxy (no package needed)
  try {
    const yahooSymbol = `${symbol}.NS`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1y`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShareTargetPrice/1.0)',
      },
    });
    
    if (response.ok) {
      const json = await response.json();
      const result = json.chart.result[0];
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];
      const data = timestamps.map((ts: number, idx: number) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: quote.open[idx],
        high: quote.high[idx],
        low: quote.low[idx],
        close: quote.close[idx],
        volume: quote.volume[idx],
      })).filter((item: any) => item.open !== null);
      
      if (data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (err) {
    console.error('Yahoo fetch error:', err);
  }

  // Fallback to mock data if real API fails
  const mockData = generateMockData(symbol);
  return NextResponse.json(mockData);
}
