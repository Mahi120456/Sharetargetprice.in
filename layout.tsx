import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ShareTargetPrice.in – Share Price Target & Stock Analysis",
    template: "%s | ShareTargetPrice.in",
  },
  description:
    "Share price targets, stock analysis, IPO reviews, SIP calculators and mutual fund insights for Indian investors.",
  keywords: ["share price target", "stock analysis", "NSE BSE", "Indian stocks", "investment"],
  authors: [{ name: "ShareTargetPrice.in" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sharetargetprice.in",
    siteName: "ShareTargetPrice.in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
