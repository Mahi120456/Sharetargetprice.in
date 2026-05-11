'use client';
export const dynamic = 'force-dynamic';   // 👈 ADD THIS LINE

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Send, Bell, AlertCircle, Key, ExternalLink, Loader2 } from 'lucide-react';

export default function AdminPushPage() {
  // ... rest of your code remains exactly the same

  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('https://sharetargetprice.in');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!title.trim()) {
      setStatus({ type: 'error', text: 'Please enter a notification title.' });
      return;
    }
    if (!message.trim()) {
      setStatus({ type: 'error', text: 'Please enter a notification message.' });
      return;
    }
    if (!secret.trim()) {
      setStatus({ type: 'error', text: 'Admin secret is required.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, url, secret }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', text: `✅ Success! ${data.sent || 'Notification'} sent to all subscribers.` });
        // Clear form? Optionally keep for next sends
        // setTitle(''); setMessage('');
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed to send notifications. Check your secret or VAPID keys.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-orange-500 transition flex items-center gap-1">
              <ChevronLeft size={18} /> Back
            </Link>
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Bell size={14} className="text-white" />
            </div>
            <h1 className="font-bold text-xl text-gray-800">Push Notifications</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 m-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 text-sm">About Push Notifications</h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  This will send a push notification to <strong>all active subscribers</strong> 
                  (users who have allowed notifications). Make sure your VAPID keys are properly configured in environment variables.
                  <br />
                  <a href="https://web.dev/push-notifications/" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1 mt-1">
                    Learn more <ExternalLink size={10} />
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notification Title</label>
              <input
                type="text"
                placeholder="e.g., HDFC Bank Share Price Target Updated"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
              <p className="text-xs text-gray-400 mt-1">Short headline (max 50 chars recommended)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
              <textarea
                rows={3}
                placeholder="Detailed message for your subscribers..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">Body of the notification (keep it concise)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target URL</label>
              <input
                type="url"
                placeholder="https://sharetargetprice.in/stock/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
              <p className="text-xs text-gray-400 mt-1">Full URL (must be https)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Key size={14} /> Admin Secret
              </label>
              <input
                type="password"
                placeholder="Your admin secret key"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
              <p className="text-xs text-gray-400 mt-1">Set via ADMIN_PUSH_SECRET environment variable</p>
            </div>

            {status && (
              <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {status.type === 'success' ? <Bell size={16} /> : <AlertCircle size={16} />}
                <span>{status.text}</span>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {loading ? 'Sending...' : 'Send to All Subscribers'}
            </button>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 border-t border-gray-100 p-5 text-xs text-gray-500 space-y-1">
            <p className="font-semibold">📌 Before using:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li>Ensure VAPID keys are set in your environment</li>
              <li>Service worker (`/sw.js`) is properly registered</li>
              <li>Users have subscribed via the frontend "Get Updates" button</li>
              <li>Test with a small segment first (future feature)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
