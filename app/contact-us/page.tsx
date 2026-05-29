// app/contact-us/page.tsx
'use client';

import { Metadata } from 'next';
import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | Share Target Price',
  description: 'Get in touch with Share Target Price team. Have questions about stock targets, mutual funds, or collaboration? Contact us today.',
  keywords: 'contact us, share target price support, financial website contact',
};

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Here you would normally send to an API endpoint or email service
    // For now, show success message (you can integrate email API later)
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
  };

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

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3">Send Us a Message</h2>
            
            {isSubmitted && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Thank you! Your message has been sent. We'll get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-orange-500`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-orange-500`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  <option>General Inquiry</option>
                  <option>Business Partnership</option>
                  <option>Technical Support</option>
                  <option>Feedback/Suggestion</option>
                  <option>Report an Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full p-3 border ${errors.message ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-orange-500`}
                  placeholder="Please describe your query in detail..."
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              By submitting this form, you agree to our privacy policy. We'll never share your details.
            </p>
          </div>
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
