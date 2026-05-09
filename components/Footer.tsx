import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500 text-white font-black text-lg px-3 py-1 rounded-lg">
                STP
              </div>
              <span className="font-bold text-white text-xl">Share Target Price</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India&apos;s trusted platform for share price targets, stock analysis, 
              IPO reviews, SIP calculators and mutual fund insights. 
              We help retail investors make informed decisions.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              ⚠️ Disclaimer: Content is for educational purposes only. 
              Not financial advice. Please consult a SEBI-registered advisor.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/share-price-target" className="hover:text-orange-400">Share Price Target</Link></li>
              <li><Link href="/category/ipo" className="hover:text-orange-400">IPO Analysis</Link></li>
              <li><Link href="/category/stock-analysis" className="hover:text-orange-400">Stock Analysis</Link></li>
              <li><Link href="/category/sip" className="hover:text-orange-400">SIP Calculator</Link></li>
              <li><Link href="/category/calculator" className="hover:text-orange-400">Financial Calculators</Link></li>
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

        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2025 ShareTargetPrice.in. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Made with ❤️ for Indian Investors | NSE & BSE Stock Analysis
          </p>
        </div>
      </div>
    </footer>
  );
}
