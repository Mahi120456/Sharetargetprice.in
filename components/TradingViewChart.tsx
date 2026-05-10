'use client';
import { useEffect, useRef } from 'react';

export default function TradingViewChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": `NSE:${symbol}`,
      "interval": "D", "timezone": "Asia/Kolkata", "theme": "light", "style": "1",
    });
    container.current?.appendChild(script);
  }, [symbol]);
  return <div className="h-[450px] w-full" ref={container}></div>;
}
