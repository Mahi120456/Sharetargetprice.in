// app/terms-conditions/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Share Target Price',
  description: 'Read the terms and conditions governing the use of Share Target Price website. Understand your rights, obligations, and our policies regarding stock and mutual fund analysis.',
  keywords: 'terms and conditions, website terms, user agreement, share target price terms',
};

export default function TermsConditionsPage() {
  const lastUpdated = '1 May 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm mb-4">
            <FileText className="w-4 h-4" />
            Legal Document
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms & Conditions</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Effective: 1 January 2026</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
            ⚠️ By accessing or using Share Target Price, you agree to be bound by these Terms & Conditions.
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using the Share Target Price website (the "Site"), you agree to comply with and be bound by 
              these Terms & Conditions. If you do not agree with any part of these terms, you must not use our Site. 
              These terms constitute a legally binding agreement between you and Share Target Price.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">2. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are intended solely for users who are at least 18 years of age and are residents of India. 
              By using the Site, you represent and warrant that you meet these eligibility requirements. Share Target Price 
              reserves the right to refuse service to anyone at any time without notice.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">3. Information Provided – No Investment Advice</h2>
            <p className="text-gray-700 leading-relaxed">
              The stock price targets, mutual fund analysis, comparison tools, calculators, and all other content on this 
              Site are for <strong>educational and informational purposes only</strong>. None of the information constitutes 
              investment advice, financial advice, trading advice, or any other sort of advice. You should not treat any 
              information on this Site as a specific recommendation to buy, sell, or hold any security or financial product.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Past performance does not guarantee future results. All investments involve risk, and you may lose money. 
              Always conduct your own research and consult with a qualified financial advisor before making any investment 
              decisions. Share Target Price and its owners shall not be held liable for any losses incurred as a result 
              of reliance on information provided on this Site.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">4. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this Site, including but not limited to text, graphics, logos, images, data compilations, 
              and software, is the property of Share Target Price or its content suppliers and is protected by Indian 
              and international copyright laws. You may not reproduce, distribute, modify, create derivative works of, 
              publicly display, or in any way exploit any of the content without prior written permission.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">5. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to use the Site only for lawful purposes. You shall not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li>Use the Site in any way that violates any applicable law or regulation</li>
              <li>Attempt to gain unauthorized access to any portion of the Site</li>
              <li>Transmit any viruses, malware, or other harmful code</li>
              <li>Scrape, crawl, or use any automated means to extract data from the Site</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">6. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Site may contain links to third-party websites or services that are not owned or controlled by Share Target Price. 
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any 
              third-party websites. You acknowledge and agree that Share Target Price shall not be responsible for any 
              damages or losses caused by your use of such third-party websites.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">7. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              THE SITE AND ALL CONTENT, TOOLS, AND INFORMATION PROVIDED THEREON ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" 
              BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. SHARE TARGET PRICE MAKES NO REPRESENTATION 
              OR WARRANTY THAT THE SITE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the fullest extent permitted by law, Share Target Price and its owners, employees, and affiliates shall not 
              be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits 
              or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible 
              losses, resulting from (i) your use of or inability to use the Site; (ii) any conduct or content of any third 
              party on the Site; or (iii) unauthorized access, use, or alteration of your transmissions or content.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">9. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Share Target Price and its owners, employees, and affiliates 
              from and against any and all claims, damages, losses, liabilities, costs, and expenses arising out of or 
              related to your use of the Site, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">10. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its 
              conflict of law principles. Any dispute arising out of or relating to these Terms or your use of the Site 
              shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">11. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is 
              material, we will make reasonable efforts to provide notice prior to any new terms taking effect. By continuing 
              to access or use our Site after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">📧 Email: <a href="mailto:support@sharetargetprice.in" className="text-orange-600 hover:underline">support@sharetargetprice.in</a></p>
              <p className="text-gray-700 mt-1">🌐 Website: <Link href="/contact-us" className="text-orange-600 hover:underline">Contact Us</Link></p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Share Target Price. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
