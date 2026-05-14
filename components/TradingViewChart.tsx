'use client';
import { useEffect, useRef, useState } from 'react';

interface TradingViewChartProps {
  symbol: string;
  height?: number;
}

export default function TradingViewChart({ symbol, height = 450 }: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);
  const retryCount = useRef(0);

  // Try multiple symbol formats
  const getSymbolVariants = (sym: string): string[] => {
    const cleanSym = sym.toUpperCase().replace(/\.NS$/, '');
    return [
      `NSE:${cleanSym}`,
      `${cleanSym}.NS`,
      `NSE:${cleanSym}-EQ`,
      `BSE:${cleanSym}`,
    ];
  };

  useEffect(() => {
    if (!symbol) return;
    setError(false);
    retryCount.current = 0;
    loadChart();
  }, [symbol]);

  const loadChart = (variantIndex = 0) => {
    if (!container.current) return;

    const variants = getSymbolVariants(symbol);
    if (variantIndex >= variants.length) {
      setError(true);
      return;
    }

    const trySymbol = variants[variantIndex];
    setCurrentSymbol(trySymbol);

    // Clear previous content
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    const widgetConfig = {
      autosize: true,
      symbol: trySymbol,
      interval: 'D',
      timezone: 'Asia/Kolkata',
      theme: 'light',
      style: '1',
      locale: 'in',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: container.current.id,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
    };

    script.innerHTML = JSON.stringify(widgetConfig);

    // Error handling for script load failure
    script.onerror = () => {
      console.warn(`TradingView failed for ${trySymbol}, trying next variant`);
      loadChart(variantIndex + 1);
    };

    container.current.appendChild(script);

    // Set a timeout to detect if widget fails to render (no chart after 5 seconds)
    const timeout = setTimeout(() => {
      if (container.current && container.current.children.length === 0) {
        console.warn(`TradingView timeout for ${trySymbol}, trying next`);
        loadChart(variantIndex + 1);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  };

  if (error) {
    return (
      <div className="w-full bg-gray-100 rounded-xl flex items-center justify-center flex-col p-8" style={{ height: `${height}px` }}>
        <div className="text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 text-sm">Chart temporarily unavailable for this stock.</p>
          <button
            onClick={() => {
              setError(false);
              loadChart(0);
            }}
            className="mt-3 text-orange-500 text-sm hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`tv-chart-${symbol}`}
      ref={container}
      className="w-full rounded-xl overflow-hidden bg-gray-100"
      style={{ height: `${height}px` }}
    />
  );
}
