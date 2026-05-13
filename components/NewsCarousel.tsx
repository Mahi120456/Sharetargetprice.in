'use client';
import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export default function NewsCarousel({ stock }: { stock: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const res = await fetch(`/api/news?stock=${encodeURIComponent(stock)}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setNews(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Unable to load news');
      } finally {
        setLoading(false);
      }
    }
    if (stock) fetchNews();
  }, [stock]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-4 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-xs text-orange-500 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-4 text-center">
        <p className="text-gray-500 text-sm">No recent news for {stock}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          📰 Latest News
        </h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {news.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 hover:bg-orange-50 transition group"
          >
            <p className="font-medium text-gray-800 group-hover:text-orange-600 line-clamp-2 text-sm">
              {item.title}
            </p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
              <span>{item.source}</span>
              <span>{new Date(item.pubDate).toLocaleDateString('en-IN')}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
