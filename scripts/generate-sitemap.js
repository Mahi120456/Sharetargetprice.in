import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Use service role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper to generate short slug (must match the one used in comparison pages)
function getShortSlugFromName(name) {
  let slug = name
    .toLowerCase()
    .replace(/ - direct plan( - growth)?/gi, '')
    .replace(/ - growth option/gi, '')
    .replace(/ fund/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (slug.length > 35) slug = slug.substring(0, 35).replace(/-$/, '');
  return slug;
}

async function generateSitemap() {
  const baseUrl = 'https://sharetargetprice.in';
  const now = new Date().toISOString();

  // Static pages (including comparison listing)
  const staticPages = [
    { url: '', priority: 1.0, freq: 'daily' },
    { url: '/all-stocks', priority: 0.9, freq: 'daily' },
    { url: '/calculators', priority: 0.9, freq: 'daily' },
    { url: '/mutual-funds', priority: 0.9, freq: 'daily' },
    { url: '/mutual-funds/top-performing-funds', priority: 0.8, freq: 'weekly' },
    { url: '/mutual-funds/comparisons', priority: 0.8, freq: 'weekly' },
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

  // ✅ FIX: Fetch calculator pages from 'calculators' table, not 'posts'
  const { data: calculators } = await supabase
    .from('calculators')
    .select('slug, last_updated')
    .order('slug');

  // Fetch authors
  const { data: authors } = await supabase
    .from('authors')
    .select('slug, updated_at');

  // ========== MUTUAL FUNDS ==========
  // Individual fund pages
  const { data: funds } = await supabase
    .from('mutual_funds')
    .select('slug, updated_at')
    .order('scheme_name');

  // Unique categories
  const { data: categoriesData } = await supabase
    .from('mutual_funds')
    .select('category')
    .not('category', 'is', null);
  const uniqueCategories = [...new Set(categoriesData?.map(c => c.category) || [])];
  const categorySlugs = uniqueCategories.map(cat => cat.toLowerCase().replace(/ /g, '-'));

  // Unique AMCs
  const { data: amcsData } = await supabase
    .from('mutual_funds')
    .select('fund_house')
    .not('fund_house', 'is', null);
  const uniqueAMCs = [...new Set(amcsData?.map(a => a.fund_house) || [])];
  const amcSlugs = uniqueAMCs.map(amc =>
    amc.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  );

  // Best funds categories (predefined)
  const bestCategories = [
    'large-cap', 'mid-cap', 'small-cap', 'elss', 'hybrid',
    'multi-cap', 'flexi-cap', 'focused-fund', 'value-fund', 'contra-fund', 'dividend-yield'
  ];
  const bestFundsSlugs = bestCategories.map(cat => `/mutual-funds/best/${cat}`);

  // ========== GENERATE ALL COMPARISON PAGES (4950) ==========
  // Fetch top 100 funds by AUM (needed for static generation)
  const { data: topFunds } = await supabase
    .from('mutual_funds')
    .select('scheme_name')
    .not('aum', 'is', null)
    .order('aum', { ascending: false })
    .limit(100);

  let comparisonSlugs = [];
  if (topFunds && topFunds.length) {
    const shortSlugs = topFunds.map(f => getShortSlugFromName(f.scheme_name));
    for (let i = 0; i < shortSlugs.length; i++) {
      for (let j = i + 1; j < shortSlugs.length; j++) {
        comparisonSlugs.push(`${shortSlugs[i]}-vs-${shortSlugs[j]}`);
      }
    }
    console.log(`Generated ${comparisonSlugs.length} comparison page slugs (expected ~4950)`);
  } else {
    console.warn('Could not fetch top 100 funds, comparison pages will be missing from sitemap');
  }

  let urls = [];

  // Add static pages
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

  // ✅ ADD ALL CALCULATOR PAGES FROM calculators TABLE
  (calculators || []).forEach(calc => {
    urls.push(`
  <url>
    <loc>${baseUrl}/calculator/${calc.slug}</loc>
    <lastmod>${calc.last_updated || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  // Authors
  (authors || []).forEach(author => {
    urls.push(`
  <url>
    <loc>${baseUrl}/author/${author.slug}</loc>
    <lastmod>${author.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  // Mutual Fund Individual Pages
  (funds || []).forEach(fund => {
    urls.push(`
  <url>
    <loc>${baseUrl}/mutual-funds/${fund.slug}</loc>
    <lastmod>${fund.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
  });

  // Category Pages
  categorySlugs.forEach(slug => {
    urls.push(`
  <url>
    <loc>${baseUrl}/mutual-funds/category/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
  });

  // AMC Pages
  amcSlugs.forEach(slug => {
    urls.push(`
  <url>
    <loc>${baseUrl}/mutual-funds/amc/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
  });

  // Best Funds Pages
  bestFundsSlugs.forEach(urlPath => {
    urls.push(`
  <url>
    <loc>${baseUrl}${urlPath}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  });

  // Add all generated comparison pages
  comparisonSlugs.forEach(slug => {
    urls.push(`
  <url>
    <loc>${baseUrl}/mutual-funds/compare/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

  fs.writeFileSync('./public/sitemap.xml', sitemap);
  console.log(`✅ Sitemap generated with ${urls.length} URLs (including ${comparisonSlugs.length} comparison pages and ${calculators?.length || 0} calculator pages)`);
}

generateSitemap().catch(console.error);
