import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stock = searchParams.get('stock');

  try {
    // Google News RSS feed for the specific stock
    const res = await fetch(`https://news.google.com/rss/search?q=${stock}+share+news&hl=en-IN&gl=IN&ceid=IN:en`);
    const text = await res.text();
    
    // Simple regex to extract titles and links (XML parsing)
    const items = text.match(/<item>([\s\S]*?)<\/item>/g)?.slice(0, 5) || [];
    const news = items.map(item => ({
      title: item.match(/<title>(.*?)<\/title>/)?.[1],
      link: item.match(/<link>(.*?)<\/link>/)?.[1],
      pubDate: item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1],
    }));

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json([]);
  }
}

