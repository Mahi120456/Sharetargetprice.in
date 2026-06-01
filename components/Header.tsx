"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const categories = [
  { name: "Home", slug: "/" },
  {
    name: "Mutual Funds",
    mega: true,
    links: [
      { name: "📊 All Mutual Funds", slug: "/mutual-funds" },
      { name: "🔄 Fund Comparisons", slug: "/mutual-funds/comparisons" },
      { name: "🏆 Top Performing Funds", slug: "/mutual-funds/top-performing-funds" },
      { name: "⭐ Best Funds by Category", slug: "/mutual-funds/best" },
      { name: "📁 Categories", slug: "/mutual-funds/categories" },
      { name: "🏢 AMC (Fund Houses)", slug: "/mutual-funds/amc" },
    ],
  },
  {
    name: "Stocks",
    dropdown: true,
    links: [
      { name: "📈 Share Price Target", slug: "/category/share-price-target" },
      { name: "📉 Stock Analysis", slug: "/category/stock-analysis" },
      { name: "📊 All Stocks", slug: "/all-stocks" },
    ],
  },
  {
    name: "IPO",
    slug: "/ipo",
  },
  {
    name: "Calculators",
    slug: "/calculator",
  },
  {
    name: "Resources",
    dropdown: true,
    links: [
      { name: "📚 About Us", slug: "/about-us" },
      { name: "📞 Contact Us", slug: "/contact-us" },
      { name: "🔒 Privacy Policy", slug: "/privacy-policy" },
      { name: "⚠️ Disclaimer", slug: "/disclaimer" },
      { name: "📜 Terms & Conditions", slug: "/terms-conditions" },
    ],
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-orange-500 text-white text-xs text-center py-1 px-4">
        📈 India&apos;s #1 Share Price Target Analysis Platform
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="text-white font-black text-xl leading-tight">
            Share Target Price
          </div>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" ref={dropdownRef}>
          {categories.map((item) => {
            if (item.mega || item.dropdown) {
              const isOpen = openDropdown === item.name;
              return (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                    className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                  >
                    {item.name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {item.links?.map((link) => (
                        <Link
                          key={link.slug}
                          href={link.slug}
                          className="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.slug}
                href={item.slug!}
                className="hover:text-orange-400 transition-colors"
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-800 px-4 py-3 space-y-2 max-h-[80vh] overflow-y-auto">
          {categories.map((item) => {
            if (item.mega || item.dropdown) {
              return (
                <div key={item.name} className="space-y-1">
                  <div className="font-semibold text-orange-400 pt-2">{item.name}</div>
                  {item.links?.map((link) => (
                    <Link
                      key={link.slug}
                      href={link.slug}
                      className="block py-2 pl-4 text-sm hover:text-orange-400 border-b border-slate-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              );
            }
            return (
              <Link
                key={item.slug}
                href={item.slug!}
                className="block py-2 text-sm hover:text-orange-400 border-b border-slate-700"
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
