// app/privacy-policy/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Lock, Eye, Database, Shield, Mail, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Share Target Price',
  description: 'Read our privacy policy to understand how we collect, use, and protect your personal information when you visit Share Target Price website.',
  keywords: 'privacy policy, data privacy, personal information, share target price privacy',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '1 May 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mb-4">
            <Lock className="w-4 h-4" />
            Privacy Commitment
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: {lastUpdated}</p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
            🔒 Your privacy is important to us. This policy explains how we handle your information.
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Share Target Price ("we", "us", or "our") operates the website https://sharetargetprice.in. 
              This Privacy Policy informs you of our policies regarding the collection, use, and disclosure 
              of personal data when you use our Site and the choices you have associated with that data. 
              We are committed to protecting your privacy and handling your personal information with 
              transparency and care.
            </p>
          </section>

          {/* Information Collection */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              Information We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed">We collect several types of information to provide and improve our service to you:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li><strong>Usage Data:</strong> We automatically collect information about how you access and use the Site, including your IP address, browser type, pages visited, time and date of visit, and other diagnostic data.</li>
              <li><strong>Device Information:</strong> We may collect information about the device you use to access our Site, such as device type, operating system, and unique device identifiers.</li>
              <li><strong>Cookies & Tracking Technologies:</strong> We use cookies and similar technologies to track activity on our Site and store certain information to enhance user experience.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              We do not collect sensitive personal information such as financial account details, PAN, or Aadhaar numbers.
            </p>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-500" />
              How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed">We use the collected information for various purposes:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li>To provide, maintain, and improve our website and services</li>
              <li>To understand and analyze how you use our Site</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To personalize your experience and deliver relevant content</li>
              <li>To send periodic emails (only if you have subscribed to our newsletter)</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Sharing Your Information</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li>With service providers who assist us in operating our website (e.g., hosting, analytics)</li>
              <li>To comply with legal obligations or respond to lawful requests from public authorities</li>
              <li>To protect our rights, property, or safety, and that of our users or the public</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable 
              means to protect your information, we cannot guarantee its absolute security.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Cookies Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our Site and store certain 
              information. Cookies are files with a small amount of data that are stored on your device. You can 
              instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
              if you do not accept cookies, you may not be able to use some portions of our Site.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Site may contain links to third-party websites. We are not responsible for the privacy practices 
              or content of these third-party sites. We encourage you to review the privacy policies of any 
              third-party sites you visit.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Site does not address anyone under the age of 18. We do not knowingly collect personally 
              identifiable information from anyone under the age of 18. If you are a parent or guardian and 
              you are aware that your child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review 
              this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">📧 Email: <a href="mailto:support@sharetargetprice.in" className="text-orange-600 hover:underline">support@sharetargetprice.in</a></p>
              <p className="text-gray-700 mt-1">🌐 Contact Form: <Link href="/contact-us" className="text-orange-600 hover:underline">Click here</Link></p>
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
