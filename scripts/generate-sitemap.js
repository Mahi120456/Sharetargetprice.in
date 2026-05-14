// scripts/generate-sitemap.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function generateSitemap() {
  const baseUrl = 'https://sharetargetprice.in';
  const now = new Date().toISOString();

  // 1. Static pages
  const staticPages = [
    { url: '', priority: 1.0, freq: 'daily' },
    { url: '/all-stocks', priority: 0.9, freq: 'daily' },
    { url: '/calculators', priority: 0.9, freq: 'daily' },
    { url: '/category/share-price-target', priority: 0.8, freq: 'daily' },
    { url: '/category/stock-analysis', priority: 0.8, freq: 'daily' },
    { url: '/category/ipo', priority: 0.7, freq: 'daily' },
    { url: '/category/mutual-funds', priority: 0.7, freq: 'daily' },
    { url: '/category/sip', priority: 0.7, freq: 'daily' },
    { url: '/category/calculator', priority: 0.7, freq: 'daily' },
    { url: '/about-us', priority: 0.5, freq: 'monthly' },
    { url: '/contact-us', priority: 0.5, freq: 'monthly' },
    { url: '/privacy-policy', priority: 0.3, freq: 'yearly' },
    { url: '/disclaimer', priority: 0.3, freq: 'yearly' },
    { url: '/terms-conditions', priority: 0.3, freq: 'yearly' },
  ];

  // Fetch all stocks
  const { data: stocks } = await supabase
    .from('stocks')
    .select('slug, last_updated')
    .order('name');

  // Fetch blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('post_type', 'post');

  // Fetch calculator pages
  const { data: calculators } = await supabase
    .from('posts')
    .select('slug')
    .eq('category', 'Calculator');

  let urls = [];

  // Static pages
  staticPages.forEach(page => {
    urls.push(`
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  });

  // Stocks
  (stocks || []).forEach(stock => {
    urls.push(`
  <url>
    <loc>${baseUrl}/stock/${stock.slug}-share-price-target</loc>
    <lastmod>${stock.last_updated || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
  });

  // Blog posts
  (posts || []).forEach(post => {
    urls.push(`
  <url>
    <loc>${baseUrl}/${post.slug}</loc>
    <lastmod>${post.updated_at || post.published_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  });

  // Calculators
  (calculators || []).forEach(calc => {
    urls.push(`
  <url>
    <loc>${baseUrl}/calculator/${calc.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

  fs.writeFileSync('./public/sitemap.xml', sitemap);
  console.log(`✅ Sitemap generated with ${urls.length} URLs`);
}

generateSitemap().catch(console.error);
