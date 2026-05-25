'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts';

interface FundPerformanceChartProps {
  historicalData: { date: string; nav: number }[];
  fundName: string;
}

const periods = [
  { label: '1M', days: 30 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '3Y', days: 1095 },
  { label: 'ALL', days: Infinity },
];

export default function FundPerformanceChart({ historicalData, fundName }: FundPerformanceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [activePeriod, setActivePeriod] = useState('1Y');
  const [returns, setReturns] = useState<{ period: string; value: number | null }[]>([]);

  // Calculate returns for each period
  useEffect(() => {
    if (!historicalData || historicalData.length === 0) return;
    const sorted = [...historicalData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestNav = sorted[sorted.length - 1]?.nav;
    if (!latestNav) return;

    const returnsCalc = periods.map(period => {
      if (period.days === Infinity) {
        const firstNav = sorted[0]?.nav;
        if (!firstNav) return { period: period.label, value: null };
        return { period: period.label, value: ((latestNav - firstNav) / firstNav) * 100 };
      }
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - period.days);
      const olderPoint = sorted.find(d => new Date(d.date) >= cutoffDate);
      if (!olderPoint) return { period: period.label, value: null };
      const olderNav = olderPoint.nav;
      return { period: period.label, value: ((latestNav - olderNav) / olderNav) * 100 };
    });
    setReturns(returnsCalc);
  }, [historicalData]);

  // Render chart when data or period changes
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // If no data, show a message
    if (!historicalData || historicalData.length === 0) {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
      return;
    }

    // Filter data by selected period
    let filtered = [...historicalData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (activePeriod !== 'ALL') {
      const period = periods.find(p => p.label === activePeriod);
      if (period && period.days !== Infinity) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - period.days);
        filtered = filtered.filter(d => new Date(d.date) >= cutoff);
      }
    }

    const chartData: LineData<Time>[] = filtered.map(d => ({
      time: Math.floor(new Date(d.date).getTime() / 1000) as Time,
      value: d.nav,
    }));

    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: { background: { color: '#ffffff' }, textColor: '#333' },
        grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
        timeScale: { timeVisible: true, secondsVisible: false },
      });
      seriesRef.current = chartRef.current.addLineSeries({ color: '#f97316', lineWidth: 2 });
    }

    seriesRef.current?.setData(chartData);
    chartRef.current?.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [historicalData, activePeriod]);

  // If no data, display a placeholder
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold text-gray-900">Performance Chart</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {periods.map(p => (
              <button
                key={p.label}
                disabled
                className="px-3 py-1 text-sm rounded-md text-gray-400"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg text-gray-500">
          No historical data available for this fund.
        </div>
        <div className="flex flex-wrap justify-around gap-3 mt-4 text-sm">
          {periods.map(p => (
            <div key={p.label} className="text-center">
              <div className="text-gray-500">{p.label}</div>
              <div className="font-bold text-gray-400">N/A</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-900">Performance Chart</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {periods.map(p => (
            <button
              key={p.label}
              onClick={() => setActivePeriod(p.label)}
              className={`px-3 py-1 text-sm rounded-md transition ${
                activePeriod === p.label
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />
      <div className="flex flex-wrap justify-around gap-3 mt-4 text-sm">
        {returns.map(r => (
          <div key={r.period} className="text-center">
            <div className="text-gray-500">{r.period}</div>
            <div className={`font-bold ${r.value && r.value > 0 ? 'text-green-600' : r.value && r.value < 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {r.value ? `${r.value.toFixed(2)}%` : 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
