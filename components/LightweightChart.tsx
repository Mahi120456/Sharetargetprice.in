'use client';
import { useEffect, useRef } from 'react';

interface LightweightChartProps {
  symbol: string;
  height?: number;
}

export default function LightweightChart({ symbol, height = 450 }: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchAndRender = async () => {
      try {
        const res = await fetch(`/api/stock/history?symbol=${symbol}`);
        const data = await res.json();
        console.log('Chart data:', data);  // Debug

        if (!containerRef.current) return;
        
        // Fallback: show simple text if library fails
        containerRef.current.innerHTML = `
          <div class="p-4 bg-gray-100 rounded-lg">
            <p class="text-sm text-gray-600">Debug: Data received for ${symbol}</p>
            <p class="text-xs font-mono mt-2">${JSON.stringify(data.slice(0, 3), null, 2)}</p>
          </div>
        `;

        // Try to dynamically load lightweight-charts
        try {
          const { createChart } = await import('lightweight-charts');
          if (!containerRef.current) return;
          
          containerRef.current.innerHTML = ''; // clear
          const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: height,
            layout: { background: { color: '#fff' }, textColor: '#333' }
          });
          const candlestickSeries = chart.addCandlestickSeries();
          const formatted = data.map((item: any) => ({
            time: Math.floor(new Date(item.date).getTime() / 1000),
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));
          candlestickSeries.setData(formatted);
          chart.timeScale().fitContent();
          console.log('Chart rendered successfully');
        } catch (err) {
          console.error('Lightweight Charts error:', err);
          // Keep fallback visible
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-red-500 p-4">Failed to load chart data</div>`;
        }
      }
    };

    fetchAndRender();

    const handleResize = () => {
      // Simple resize handling not critical for debug
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [symbol, height]);

  return <div ref={containerRef} style={{ width: '100%', height: `${height}px` }} className="rounded-xl overflow-hidden bg-white border" />;
}
