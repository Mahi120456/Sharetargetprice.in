'use client';
import { useState } from 'react';

export default function AdminPushPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('https://sharetargetprice.in');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = async () => {
    setStatus('Sending...');
    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, url, secret })
    });

    if (res.ok) {
      setStatus('✅ Success! Notifications sent to all users.');
    } else {
      setStatus('❌ Failed! Check your secret or keys.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-3xl border shadow-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Broadcast Notification</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input className="w-full p-3 border rounded-xl" placeholder="e.g. Adani Power Target Hit!" onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea className="w-full p-3 border rounded-xl" rows={3} placeholder="Full analysis update available now..." onChange={e => setMessage(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target URL</label>
          <input className="w-full p-3 border rounded-xl" placeholder="https://sharetargetprice.in/stock/..." value={url} onChange={e => setUrl(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Admin Secret Code</label>
          <input type="password" className="w-full p-3 border rounded-xl border-orange-200" placeholder="Enter your secret code" onChange={e => setSecret(e.target.value)} />
        </div>

        <button onClick={handleSend} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all">
          🚀 Send to All Subscribers
        </button>
        
        {status && <p className="text-center font-medium mt-4 p-3 bg-gray-50 rounded-xl">{status}</p>}
      </div>
    </div>
  );
}
