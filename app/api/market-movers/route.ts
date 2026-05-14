import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET() {
  try {
    // Fetch gainers and losers in parallel
    const [gainersData, losersData] = await Promise.all([
      yahooFinance.screener({ scrIds: 'day_gainers', region: 'IN', count: 10 }),
      yahooFinance.screener({ scrIds: 'day_losers', region: 'IN', count: 10 }),
    ]);

    // Format gainers
    const gainers = gainersData.quotes.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.longName || stock.shortName || stock.symbol,
      price: stock.regularMarketPrice,
      change: stock.regularMarketChange,
      changePercent: stock.regularMarketChangePercent,
      volume: stock.regularMarketVolume,
    }));

    // Format losers
    const losers = losersData.quotes.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.longName || stock.shortName || stock.symbol,
      price: stock.regularMarketPrice,
      change: stock.regularMarketChange,
      changePercent: stock.regularMarketChangePercent,
      volume: stock.regularMarketVolume,
    }));

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
