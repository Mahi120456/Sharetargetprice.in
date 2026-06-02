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

export const metadata: Metadata = {
  title: {
    default: "Share Target Price – India's Smart Stock Research Platform",
    template: "%s | Share Target Price",
  },
  description:
    "Analyze stocks, IPOs, mutual funds & financial calculators in one place. Share price targets, market movers, IPO GMP, SIP tools – all free.",
  keywords:
    "share price target, stock analysis, IPO GMP, mutual funds, SIP calculator, nse bse, equity research",
  authors: [{ name: "Share Target Price Team" }],
  openGraph: {
    title: "Share Target Price – India's Smart Stock Research Platform",
    description:
      "Stock analysis, IPO tracker, mutual fund research, financial calculators – all in one place.",
    url: "https://sharetargetprice.in",
    siteName: "Share Target Price",
    images: [{ url: "https://sharetargetprice.in/og-image.jpg", width: 1200, height: 630, alt: "Share Target Price" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Target Price – Stock Research Platform",
    description: "Stock targets, IPO GMP, mutual funds, calculators.",
    images: ["https://sharetargetprice.in/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://sharetargetprice.in" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="google-site-verification" content="hafalse8HQrL6F1jcch_jCMJKRaE7JrUCFezXd3eG1o" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Share Target Price" />
        <meta name="mobile-web-app-capable" content="yes" />

        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {/* ✅ Google Analytics (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-F9TG7CDJP2"
        />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-F9TG7CDJP2', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Share Target Price",
              "url": "https://sharetargetprice.in",
              "description": "India's smart stock research platform – stock targets, IPO GMP, mutual funds, calculators.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://sharetargetprice.in/all-stocks?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Share Target Price",
              "url": "https://sharetargetprice.in",
              "logo": "https://sharetargetprice.in/og-image.jpg",
              "sameAs": [
                "https://twitter.com/sharetargetprice",
                "https://facebook.com/sharetargetprice"
              ]
            })
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gray-50">
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
