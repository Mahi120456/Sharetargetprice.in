// app/api/mutual-fund/live/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let schemeCode = searchParams.get('code');
  
  if (!schemeCode) {
    return NextResponse.json({ error: 'Scheme code missing' }, { status: 400 });
  }
  
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    const data = await res.json();
    
    if (!data || !data.data) {
      return NextResponse.json({ error: 'Fund not found' }, { status: 404 });
    }
    
    const latest = data.data[0];
    const historical = data.data.slice(0, 30);
    
    return NextResponse.json({
      scheme_code: data.meta?.scheme_code,
      scheme_name: data.meta?.scheme_name,
      fund_house: data.meta?.fund_house,
      category: data.meta?.scheme_category,
      nav: parseFloat(latest.nav),
      date: latest.date,
      historical: historical.map((h: any) => ({
        date: h.date,
        nav: parseFloat(h.nav)
      }))
    });
  } catch (error) {
    console.error('MF API error:', error);
    return NextResponse.json({ error: 'Failed to fetch fund data' }, { status: 500 });
  }
}
