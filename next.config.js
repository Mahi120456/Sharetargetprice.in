/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for development (helps catch issues)
  reactStrictMode: true,

  // Disable x-powered-by header (security)
  poweredByHeader: false,

  // Enable gzip compression (already default on Vercel, but explicit)
  compress: true,

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sharetargetprice.in',
      },
      {
        protocol: 'https',
        hostname: '**.wordpress.com',
      },
      // Add any other image hosts you use (e.g., unsplash, tradingview)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.yahoo.com',
      },
    ],
    // Device/image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable static import for external images? no.
  },

  // Redirects (preserve WordPress URLs)
  async redirects() {
    return [
      // WordPress date‑based URLs → new slug‑based URLs
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
        destination: '/:slug',
        permanent: true,
      },
      // Add any other redirects (e.g., old stock paths)
      // {
      //   source: '/stock/:slug',
      //   destination: '/stock/:slug-share-price-target',
      //   permanent: true,
      // },
    ];
  },

  // Optional: Remove console logs in production (cleaner logs)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack fine-tuning (if needed)
  webpack: (config, { isServer }) => {
    // Optimize bundle size by removing unused packages? (example)
    // config.optimization.minimize = true;
    return config;
  },

  // Output standalone (good for Docker, but Vercel uses it by default)
  output: 'standalone',

  // Increase build time limit if needed (Vercel default 60s, fine)
  // staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;
