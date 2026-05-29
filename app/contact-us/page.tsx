import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import Link from 'next/link';
import { Mail, MessageCircle, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Share Target Price',
  description: 'Get in touch with Share Target Price team. Have questions about stock targets, mutual funds, or collaboration? Contact us today.',
  keywords: 'contact us, share target price support, financial website contact',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our stock analysis, mutual fund comparisons, or want to collaborate? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <a href="mailto:support@sharetargetprice.in" className="text-gray-600 hover:text-orange-600">support@sharetargetprice.in</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">WhatsApp / Telegram</p>
                    <a href="https://wa.me/91XXXXXXXXXX" className="text-gray-600 hover:text-orange-600">+91-XXXXXXXXXX</a>
                    <p className="text-xs text-gray-400 mt-1">Available: Mon-Fri, 10 AM – 6 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Office Address</p>
                    <p className="text-gray-600">New Delhi, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">📱 Business Inquiries</h2>
              <p className="text-gray-600 text-sm mb-3">
                For advertising, guest posting, or partnership opportunities:
              </p>
              <a href="mailto:business@sharetargetprice.in" className="text-orange-600 font-medium hover:underline">business@sharetargetprice.in</a>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Links</h2>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/about-us" className="text-sm text-gray-600 hover:text-orange-600">About Us</Link>
                <Link href="/disclaimer" className="text-sm text-gray-600 hover:text-orange-600">Disclaimer</Link>
                <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-orange-600">Privacy Policy</Link>
                <Link href="/terms-conditions" className="text-sm text-gray-600 hover:text-orange-600">Terms & Conditions</Link>
              </div>
            </div>
          </div>

          {/* Contact Form (Client Component) */}
          <ContactForm />
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800">How accurate are your stock targets?</h3>
              <p className="text-gray-600 text-sm mt-1">Our targets are based on AI models and historical data. Please refer to our disclaimer for limitations.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Can I use your data for my website?</h3>
              <p className="text-gray-600 text-sm mt-1">Please contact us for licensing and partnership discussions.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Do you provide personalized investment advice?</h3>
              <p className="text-gray-600 text-sm mt-1">No, we are not SEBI-registered advisors. All content is educational.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">How often do you update mutual fund data?</h3>
              <p className="text-gray-600 text-sm mt-1">We update data regularly from official sources like AMFI and fund factsheets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
