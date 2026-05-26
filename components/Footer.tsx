import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold text-white text-xl">Share Target Price</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India&apos;s trusted platform for share price targets, stock analysis, 
              IPO reviews, SIP calculators and mutual fund insights. 
              We help retail investors make informed decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/share-price-target" className="hover:text-orange-400">Share Price Target</Link></li>
              <li><Link href="/mutual-funds" className="hover:text-orange-400">Mutual Funds</Link></li>
              <li><Link href="/category/ipo" className="hover:text-orange-400">IPO Analysis</Link></li>
              <li><Link href="/category/stock-analysis" className="hover:text-orange-400">Stock Analysis</Link></li>
              <li><Link href="/category/sip" className="hover:text-orange-400">SIP Calculator</Link></li>
              <li><Link href="/calculator" className="hover:text-orange-400">Financial Calculators</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about-us" className="hover:text-orange-400">About Us</Link></li>
              <li><Link href="/contact-us" className="hover:text-orange-400">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-orange-400">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-orange-400">Disclaimer</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-orange-400">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* ✅ Disclaimer – Centered separately */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-yellow-50/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-200 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-yellow-400 text-base">⚠️</span>
              <span>
                <strong className="text-yellow-300">Disclaimer:</strong> Content is for educational purposes only. 
                Not financial advice. Please consult a SEBI-registered advisor before making any investment decisions.
              </span>
            </div>
          </div>
        </div>

        {/* Centered footer bottom */}
        <div className="mt-8 pt-4 text-center text-xs text-gray-500">
          <p>Copyright © 2026 Share Target Price. All rights reserved.</p>
          <p className="mt-2">
            Made with ❤️ for Indian Investors | NSE & BSE Stock Analysis
          </p>
        </div>
      </div>
    </footer>
  );
}
