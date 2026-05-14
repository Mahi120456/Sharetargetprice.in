'use client';
import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';

interface LightweightChartProps {
  symbol: string;
  height?: number;
}

export default function LightweightChart({ symbol, height = 450 }: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !symbol) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/stock/history?symbol=${symbol}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          console.warn('No historical data for', symbol);
          return;
        }

        if (!chartRef.current) {
          chartRef.current = createChart(chartContainerRef.current!, {
            layout: {
              background: { color: '#ffffff' },
              textColor: '#333',
            },
            grid: {
              vertLines: { color: '#f0f0f0' },
              horzLines: { color: '#f0f0f0' },
            },
            width: chartContainerRef.current!.clientWidth,
            height: height,
            timeScale: {
              timeVisible: true,
              secondsVisible: false,
            },
          });

          seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
        }

        // Format data: time as Unix timestamp (seconds) - cast to Time
        const formattedData = data.map((item: any) => ({
          time: Math.floor(new Date(item.date).getTime() / 1000) as Time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        seriesRef.current?.setData(formattedData);
        chartRef.current?.timeScale().fitContent();
      } catch (err) {
        console.error('Failed to load chart data:', err);
      }
    };

    fetchData();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [symbol, height]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height: `${height}px` }}
      className="rounded-xl overflow-hidden bg-white border border-gray-200"
    />
  );
}
