"use client";
import Link from "next/link";
import { useState } from "react";

const categories = [
  { name: "Home", slug: "/" },
  { name: "Share Price Target", slug: "/category/share-price-target" },
  { name: "Stock Analysis", slug: "/category/stock-analysis" },
  { name: "IPO", slug: "/category/ipo" },
  { name: "Mutual Funds", slug: "/category/mutual-funds" },
  { name: "SIP", slug: "/category/sip" },
  { name: "Calculators", slug: "/category/calculator" },
  { name: "About Us", slug: "/about-us" },
  { name: "Contact Us", slug: "/contact-us" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="bg-orange-500 text-white text-xs text-center py-1 px-4">
        📈 India&apos;s #1 Share Price Target Analysis Platform
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - Sirf Text */}
        <Link href="/" className="flex items-center">
          <div className="text-white font-black text-xl leading-tight">
  Share Target Price
</div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug}
              className="hover:text-orange-400 transition-colors font-medium"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-800 px-4 py-3 space-y-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug}
              className="block py-2 text-sm hover:text-orange-400 border-b border-slate-700"
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
