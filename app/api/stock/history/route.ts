import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get('symbol');
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol missing' }, { status: 400 });
  }

  try {
    const yahooSymbol = `${symbol}.NS`;
    const period1 = new Date();
    period1.setFullYear(period1.getFullYear() - 2); // 2 years of data
    const query = await yahooFinance.historical(yahooSymbol, {
      period1: period1.toISOString().split('T')[0],
      interval: '1d',
    });

    const formattedData = query.map((item) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Historical data error:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}
