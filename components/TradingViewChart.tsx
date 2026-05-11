'use client';
import { useEffect, useRef, useState } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
  interval?: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';
  height?: number;
  hideSideToolbar?: boolean;
  allowSymbolChange?: boolean;
}

export default function TradingViewChart({ 
  symbol, 
  theme = 'light', 
  interval = 'D',
  height = 500,
  hideSideToolbar = false,
  allowSymbolChange = true
}: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    // Clean up previous script
    if (container.current) {
      container.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    
    const widgetConfig = {
      autosize: true,
      symbol: `NSE:${symbol}`,
      interval: interval,
      timezone: 'Asia/Kolkata',
      theme: theme,
      style: '1',
      locale: 'in',
      toolbar_bg: theme === 'light' ? '#f1f3f6' : '#1e222d',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_side_toolbar: hideSideToolbar,
      allow_symbol_change: allowSymbolChange,
      save_image: false,
      container_id: 'tv-chart-container',
      studies: [
        'MASimple@tv-basicstudies',
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
        'StochasticRSI@tv-basicstudies'
      ],
      drawing_access: {
        type: 'black',
        tools: [
          'TrendLine', 'Ray', 'Arrow', 'HorizontalLine', 
          'VerticalLine', 'Rectangle', 'Circle', 'Ellipse',
          'Text', 'FibRetracement', 'SupportResistance'
        ]
      },
      time_frames: [
        { text: '1m', resolution: '1' },
        { text: '5m', resolution: '5' },
        { text: '15m', resolution: '15' },
        { text: '30m', resolution: '30' },
        { text: '1h', resolution: '60' },
        { text: '1d', resolution: 'D' },
        { text: '1w', resolution: 'W' },
        { text: '1M', resolution: 'M' }
      ],
      charts_storage_api_version: '1.1',
      client_id: 'sharetargetprice.in',
      user_id: 'public_user'
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    
    script.onload = () => {
      setIsLoading(false);
    };
    
    script.onerror = () => {
      setError('Failed to load TradingView chart. Please refresh the page.');
      setIsLoading(false);
    };

    container.current?.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme, interval, hideSideToolbar, allowSymbolChange]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-100" style={{ height: `${height}px` }}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading {symbol} Chart...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-red-600 text-sm text-center px-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
          >
            Refresh
          </button>
        </div>
      )}
      <div id="tv-chart-container" ref={container} className="w-full h-full" />
    </div>
  );
}
