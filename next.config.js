/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
  async redirects() {
    return [
      // Preserve WordPress URLs for SEO
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
