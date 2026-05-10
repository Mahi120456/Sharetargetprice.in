import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`);
    const data = await res.json();
    const price = data.chart.result[0].meta.regularMarketPrice;
    return NextResponse.json({ price: price.toFixed(2) });
  } catch (e) {
    return NextResponse.json({ price: 'Live' });
  }
}
