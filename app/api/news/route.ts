import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stock = searchParams.get('stock');

  if (!stock) {
    return NextResponse.json({ error: 'Stock name missing' }, { status: 400 });
  }

  try {
    // 1. URL encoding zaroori hai taaki "Adani Power" jaise space wale naam break na ho
    const query = encodeURIComponent(`${stock} share price target news`);
    const res = await fetch(
      `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`,
      { 
        next: { revalidate: 1800 } // Har 30 mins me news refresh hogi (Fast & Fresh)
      }
    );
    
    const text = await res.text();
    
    // 2. XML Parsing with safer regex
    const items = text.match(/<item>([\s\S]*?)<\/item>/g)?.slice(0, 6) || [];
    
    const news = items.map(item => {
      const rawTitle = item.match(/<title>(.*?)<\/title>/)?.[1] || 'Stock Update';
      
      return {
        // Source name (e.g. " - Moneycontrol") hatane ke liye
        title: rawTitle.split(' - ')[0], 
        link: item.match(/<link>(.*?)<\/link>/)?.[1] || '#',
        pubDate: item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString(),
      };
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("News API Error:", error);
    // Error hone par khali array bhejenge taaki UI crash na ho
    return NextResponse.json([]);
  }
}
