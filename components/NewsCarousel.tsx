'use client';
import { useState, useEffect } from 'react';

export default function NewsCarousel({ stock }: { stock: string }) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getNews() {
      try {
        setLoading(true);
        // Humne jo API banaya tha wahan se data fetch karega
        const res = await fetch(`/api/news?stock=${encodeURIComponent(stock)}`);
        const data = await res.json();
        setNews(data);
      } catch (error) {
        console.error("News fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    if (stock) getNews();
  }, [stock]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        Latest News: {stock}
      </h3>

      <div className="space-y-3">
        {loading ? (
          // Loading Shimmer Effect
          [1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl"></div>
          ))
        ) : news.length > 0 ? (
          news.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 bg-gray-50 rounded-xl border-l-4 border-transparent hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-700 line-clamp-2">
                {item.title}
              </p>
              <span className="text-[10px] text-gray-400 mt-1 block uppercase tracking-wider">
                {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Just Now'}
              </span>
            </a>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic">No recent news found for this stock. Checking updates...</p>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-50">
        <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">
          View All Market Updates →
        </button>
      </div>
    </div>
  );
}
