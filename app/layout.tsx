import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import PushSetup from "@/components/PushSetup";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sharetargetprice.in"),
  title: {
    default: "ShareTargetPrice.in – Share Price Target & Stock Analysis",
    template: "%s | ShareTargetPrice.in",
  },
  description:
    "Share price targets, stock analysis, IPO reviews, SIP calculators and mutual fund insights for Indian investors.",
  keywords: ["share price target", "stock analysis", "NSE BSE", "Indian stocks", "investment", "stock market"],
  authors: [{ name: "ShareTargetPrice.in", url: "https://sharetargetprice.in" }],
  creator: "ShareTargetPrice.in",
  publisher: "ShareTargetPrice.in",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sharetargetprice.in",
    siteName: "ShareTargetPrice.in",
    title: "ShareTargetPrice.in – Share Price Target & Stock Analysis",
    description: "Expert share price targets and analysis for Indian stocks.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ShareTargetPrice.in",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShareTargetPrice.in – Share Price Target & Stock Analysis",
    description: "Expert share price targets and analysis for Indian stocks.",
    images: ["/twitter-image.jpg"],
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
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
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
        
        {/* Push notification UI component */}
        <PushSetup />
        
        <Header />
        
        <main className="min-h-screen">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
