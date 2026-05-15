import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import PushSetup from "@/components/PushSetup";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// ✅ Global SEO metadata (homepage and fallback)
export const metadata: Metadata = {
  title: {
    default: "Share Target Price | India's #1 Stock Price Forecast Platform",
    template: "%s | Share Target Price",
  },
  description:
    "Accurate share price targets, in-depth analysis & long-term forecasts for 500+ NSE/BSE stocks. Trusted by Indian retail investors.",
  keywords:
    "share target price, stock price target, nse target price, bse target price, stock analysis, indian stock market",
  authors: [{ name: "Share Target Price Team" }],
  openGraph: {
    title: "Share Target Price – India's #1 Stock Price Forecast Platform",
    description:
      "Get accurate share price targets for 500+ Indian stocks. Long-term forecasts, charts, and fundamental analysis.",
    url: "https://sharetargetprice.in",
    siteName: "Share Target Price",
    images: [
      {
        url: "https://sharetargetprice.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Share Target Price – India's #1 Stock Price Forecast Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Target Price – Stock Price Forecasts",
    description: "Accurate share price targets for Indian stocks.",
    images: ["https://sharetargetprice.in/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://sharetargetprice.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="hafalse8HQrL6F1jcch_jCMJKRaE7JrUCFezXd3eG1o"
        />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Share Target Price" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="font-sans antialiased bg-gray-50">
        {/* Service Worker Registration for Push Notifications */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('Service Worker registered', reg))
                  .catch(err => console.error('SW registration failed:', err));
              }
            `,
          }}
        />

        <PushSetup />
        <Header />

        <main className="min-h-screen">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
