// app/disclaimer/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert, FileWarning } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer | Share Target Price',
  description: 'Read our disclaimer regarding stock price targets, mutual fund analysis, and investment information. All content is for educational purposes only.',
  keywords: 'disclaimer, investment disclaimer, financial disclaimer, share target price disclaimer',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm mb-4">
            <AlertTriangle className="w-4 h-4" />
            Legal Disclaimer
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Disclaimer</h1>
          <div className="p-3 bg-red-50 rounded-lg text-red-800 text-sm">
            ⚠️ Please read this disclaimer carefully before using our website.
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          
          {/* No Investment Advice */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              Not Investment Advice
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The information provided on Share Target Price, including but not limited to stock price targets, 
              mutual fund analysis, comparison tools, calculators, and all other content, is for <strong>educational 
              and informational purposes only</strong>. It does not constitute investment advice, financial advice, 
              trading advice, or any other form of professional advice. You should not treat any information on 
              this website as a specific recommendation to buy, sell, or hold any security or financial product.
            </p>
          </section>

          {/* No Guarantees */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-orange-500" />
              No Guarantees
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Past performance does not guarantee future results. The stock price targets, mutual fund return 
              projections, and any other forward-looking statements on this website are based on historical data 
              and various assumptions. Actual results may differ materially from those expressed or implied. 
              All investments involve risk, and you may lose money. Share Target Price makes no representation 
              or warranty regarding the accuracy, completeness, or reliability of any information provided on this Site.
            </p>
          </section>

          {/* Accuracy of Information */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Accuracy of Information</h2>
            <p className="text-gray-700 leading-relaxed">
              While we strive to keep the information on this website accurate and up-to-date, we make no 
              representations or warranties of any kind, express or implied, about the completeness, accuracy, 
              reliability, suitability, or availability of the information. Any reliance you place on such information 
              is strictly at your own risk. Data on NAV, AUM, expense ratios, and returns are sourced from publicly 
              available sources and may be subject to delays or errors.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. These links are provided for your convenience 
              only. We have no control over the content, privacy policies, or practices of any third-party sites 
              and do not endorse or assume any responsibility for them. Accessing third-party websites is at your 
              own risk.
            </p>
          </section>

          {/* Personal Responsibility */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Personal Responsibility</h2>
            <p className="text-gray-700 leading-relaxed">
              You are solely responsible for your own investment decisions. Before making any financial decisions, 
              you should consult with a qualified financial advisor and conduct your own independent research. 
              Share Target Price and its owners, employees, and affiliates shall not be held liable for any 
              losses, damages, or other liabilities incurred as a result of your reliance on information provided 
              on this website.
            </p>
          </section>

          {/* SEBI Disclaimer */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">SEBI Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              Share Target Price is not registered with the Securities and Exchange Board of India (SEBI) as an 
              investment advisor. The content on this website does not constitute any form of regulated advice. 
              Visitors are advised to verify all information independently and consult with a SEBI-registered 
              investment advisor before making any investment decisions.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the fullest extent permitted by law, Share Target Price shall not be liable for any direct, 
              indirect, incidental, special, consequential, or exemplary damages, including but not limited to 
              damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or 
              in connection with your use of or inability to use the website, even if advised of the possibility 
              of such damages.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this disclaimer, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">📧 Email: <a href="mailto:support@sharetargetprice.in" className="text-orange-600 hover:underline">support@sharetargetprice.in</a></p>
            </div>
          </section>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Share Target Price. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
