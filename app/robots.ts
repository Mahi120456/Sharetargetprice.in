import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://sharetargetprice.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',           // API routes should not be indexed
        '/_next/',         // Next.js internal files
        '/admin/',         // Admin panel
        '/admin/dashboard',
        '/admin/push',
        '/admin/new',
        '/admin/edit/',
        '/api/stock/live', // Dynamic live data endpoints (no need to index)
        '/api/news',
        '/api/push/',
        '/_vercel/',       // Vercel internal
        '/*.json$',        // JSON files
        '/*.xml$',         // XML files except sitemap
        '/*.txt$',         // Text files
        '/sw.js',          // Service worker (should not be indexed)
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
