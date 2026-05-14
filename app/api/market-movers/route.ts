import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Yahoo Finance screener endpoints (unofficial, no API key required)
    const gainersUrl = 'https://query1.finance.yahoo.com/v1/finance/screener?scrIds=day_gainers&region=IN&count=10';
    const losersUrl = 'https://query1.finance.yahoo.com/v1/finance/screener?scrIds=day_losers&region=IN&count=10';

    const [gainersRes, losersRes] = await Promise.all([
      fetch(gainersUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch(losersUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
    ]);

    const gainersData = await gainersRes.json();
    const losersData = await losersRes.json();

    const gainers = gainersData.finance?.result?.[0]?.quotes?.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.longName || stock.shortName || stock.symbol,
      price: stock.regularMarketPrice,
      change: stock.regularMarketChange,
      changePercent: stock.regularMarketChangePercent,
      volume: stock.regularMarketVolume,
    })) || [];

    const losers = losersData.finance?.result?.[0]?.quotes?.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.longName || stock.shortName || stock.symbol,
      price: stock.regularMarketPrice,
      change: stock.regularMarketChange,
      changePercent: stock.regularMarketChangePercent,
      volume: stock.regularMarketVolume,
    })) || [];

    return NextResponse.json({
      success: true,
      gainers,
      losers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Market movers API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market movers' },
      { status: 500 }
    );
  }
}
