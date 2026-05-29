'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
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

    // TODO: integrate actual email API
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
  };

  return (
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
  );
}
