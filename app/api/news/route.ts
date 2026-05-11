import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

// Multiple RSS sources for Indian stock news
const RSS_FEEDS = [
  {
    url: 'https://www.moneycontrol.com/rss/buzzingstocks.xml',
    source: 'Moneycontrol',
    priority: 1,
  },
  {
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977024451.cms',
    source: 'Economic Times',
    priority: 2,
  },
  {
    url: 'https://www.business-standard.com/rss/markets_stocks-111.rss',
    source: 'Business Standard',
    priority: 3,
  },
  {
    url: 'https://www.livemint.com/rss/markets',
    source: 'Mint',
    priority: 4,
  },
];

// Cache for news data (simple in-memory, resets on serverless function cold start)
let newsCache: {
  stock: string;
  data: any[];
  timestamp: number;
} | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stock = searchParams.get('stock');

  if (!stock) {
    return NextResponse.json({ error: 'Stock name missing' }, { status: 400 });
  }

  // Check cache
  if (newsCache && newsCache.stock === stock && Date.now() - newsCache.timestamp < CACHE_TTL) {
    return NextResponse.json(newsCache.data, {
      headers: {
        'Cache-Control': 'max-age=1800, stale-while-revalidate=300',
      },
    });
  }

  try {
    const stockLower = stock.toLowerCase();
    const allArticles: any[] = [];

    // Fetch from all RSS feeds in parallel
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        const filtered = feedData.items
          .filter((item) => {
            const title = item.title?.toLowerCase() || '';
            // Stock name must appear in title (word boundary check)
            return title.includes(stockLower);
          })
          .slice(0, 5) // Per feed limit
          .map((item) => ({
            title: item.title?.replace(/<[^>]*>/g, '') || 'Stock Update',
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            source: feed.source,
          }));
        allArticles.push(...filtered);
      } catch (feedError) {
        console.error(`Error fetching RSS feed ${feed.source}:`, feedError);
      }
    });

    await Promise.all(feedPromises);

    // Remove duplicates by title (case-insensitive)
    const uniqueArticles = allArticles.filter(
      (article, index, self) =>
        index === self.findIndex((a) => a.title.toLowerCase() === article.title.toLowerCase())
    );

    // Sort by date (newest first)
    uniqueArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Take top 8
    const finalNews = uniqueArticles.slice(0, 8);

    // Update cache
    newsCache = {
      stock,
      data: finalNews,
      timestamp: Date.now(),
    };

    // Add cache control headers
    return NextResponse.json(finalNews, {
      headers: {
        'Cache-Control': 'max-age=1800, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('News API Error:', error);
    // Return empty array on failure (graceful degradation)
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}
