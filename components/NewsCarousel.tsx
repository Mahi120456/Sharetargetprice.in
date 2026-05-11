'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  contentSnippet?: string;
}

export default function NewsCarousel({ stock }: { stock: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  let autoScrollInterval: NodeJS.Timeout;

  const fetchNews = useCallback(async () => {
    if (!stock) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/news?stock=${encodeURIComponent(stock)}`);
      
      if (!res.ok) throw new Error('Failed to fetch news');
      
      const data = await res.json();
      setNews(data.slice(0, 12)); // Limit to 12 news items
    } catch (error) {
      console.error("News fetch error:", error);
      setError('Unable to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [stock]);

  useEffect(() => {
    fetchNews();
    
    // Refresh news every 5 minutes
    const refreshInterval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [fetchNews]);

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScroll && news.length > 0 && scrollRef.current) {
      autoScrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
          if (scrollRef.current.scrollLeft >= maxScroll) {
            scrollRef.current.scrollLeft = 0;
          } else {
            scrollRef.current.scrollLeft += 300;
          }
        }
      }, 5000);
    }
    
    return () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };
  }, [autoScroll, news.length]);

  const handleManualScroll = () => {
    setAutoScroll(false);
    setTimeout(() => setAutoScroll(true), 10000); // Resume auto-scroll after 10 seconds
  };

  // Get source logo/icon
  const getSourceIcon = (source: string) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('moneycontrol')) return '💰';
    if (sourceLower.includes('economictimes')) return '📰';
    if (sourceLower.includes('business-standard')) return '📊';
    if (sourceLower.includes('livemint')) return '🌿';
    return '📈';
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-gray-900">Latest News</h3>
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-4">Latest News</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gray-500 text-sm">{error}</p>
          <button 
            onClick={() => fetchNews()} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-4">Latest News</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500 text-sm">No recent news found for {stock}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <h3 className="font-bold text-xl text-gray-900">Latest News</h3>
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full ml-2">
              {stock}
            </span>
          </div>
          
          {/* Auto-scroll toggle */}
          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-3 py-1 rounded-full transition-all ${
              autoScroll ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {autoScroll ? '⏸ Pause Scroll' : '▶ Auto Scroll'}
          </button>
        </div>
      </div>

      {/* Horizontal Scroll News Carousel */}
      <div 
        ref={scrollRef}
        onScroll={handleManualScroll}
        className="overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex gap-4 p-5 min-w-max">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-80 md:w-96 flex-shrink-0 bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200 group cursor-pointer"
            >
              {/* Source badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{getSourceIcon(item.source)}</span>
                  <span className="text-xs font-medium text-gray-600 capitalize">
                    {item.source || 'News Source'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {getRelativeTime(item.pubDate)}
                </span>
              </div>
              
              {/* Headline */}
              <h4 className="font-semibold text-gray-800 line-clamp-3 group-hover:text-orange-600 transition-colors text-sm leading-relaxed">
                {item.title}
              </h4>
              
              {/* Snippet (if available) */}
              {item.contentSnippet && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {item.contentSnippet.replace(/<[^>]*>/g, '').substring(0, 120)}...
                </p>
              )}
              
              {/* Read more link */}
              <div className="mt-3 flex items-center gap-1 text-orange-500 opacity-0 group-hover:opacity-100 transition-all">
                <span className="text-xs font-medium">Read more</span>
                <span className="text-sm">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>📰 {news.length} news items</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>🔄 Auto-refreshes every 5 min</span>
          </div>
          <button 
            onClick={() => fetchNews()}
            className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            Refresh ↻
          </button>
        </div>
      </div>
    </div>
  );
}
