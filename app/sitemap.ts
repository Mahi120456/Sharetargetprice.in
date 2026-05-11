import { createClient } from '@supabase/supabase-js';
import type { MetadataRoute } from 'next';

// Helper to create Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sharetargetprice.in';
  const now = new Date();

  // 1. Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/all-stocks`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/calculators`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/category/share-price-target`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/category/stock-analysis`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/category/ipo`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/category/mutual-funds`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/category/sip`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/category/calculator`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms-conditions`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // 2. Blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('post_type', 'post')
    .order('published_at', { ascending: false });

  const postUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Stock pages (30,000+ stocks – but we limit to top 5000 to avoid huge sitemap? Actually sitemap can have up to 50k URLs per file.
  // For simplicity, fetch all stocks. If >50k, you need sitemap index. We assume <50k.)
  const { data: stocks } = await supabase
    .from('stocks')
    .select('slug, last_updated')
    .order('name', { ascending: true });

  const stockUrls: MetadataRoute.Sitemap = (stocks || []).map((stock) => ({
    url: `${baseUrl}/stock/${stock.slug}-share-price-target`,
    lastModified: new Date(stock.last_updated || now),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 4. Calculator pages
  const { data: calculators } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('category', 'Calculator')
    .eq('post_type', 'page')
    .order('title', { ascending: true });

  const calculatorUrls: MetadataRoute.Sitemap = (calculators || []).map((calc) => ({
    url: `${baseUrl}/calculator/${calc.slug}`,
    lastModified: new Date(calc.updated_at || now),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Combine all
  return [
    ...staticPages,
    ...postUrls,
    ...stockUrls,
    ...calculatorUrls,
  ];
}
