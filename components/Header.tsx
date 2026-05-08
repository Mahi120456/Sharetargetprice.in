"use client";
import Link from "next/link";
import { useState } from "react";

const categories = [
  { name: "Share Price Target", slug: "share-price-target" },
  { name: "Stock Analysis", slug: "stock-analysis" },
  { name: "IPO", slug: "ipo" },
  { name: "Mutual Funds", slug: "mutual-funds" },
  { name: "SIP", slug: "sip" },
  { name: "Calculators", slug: "calculator" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-orange-500 text-white text-xs text-center py-1 px-4">
        📈 India&apos;s #1 Share Price Target Analysis Platform
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-orange-500 text-white font-black text-lg px-3 py-1 rounded-lg">
            STP
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">ShareTargetPrice</div>
            <div className="text-orange-400 text-xs">.in</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="hover:text-orange-400 transition-colors font-medium"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="space-y-1">
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-800 px-4 py-3 space-y-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
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
