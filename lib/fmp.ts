// lib/fmp.ts
const API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

export async function fetchFromFMP(endpoint: string) {
  const url = `${BASE_URL}/${endpoint}?apikey=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
  if (!res.ok) return null;
  return res.json();
}

// Company profile (for sector, industry, etc.)
export async function getCompanyProfile(symbol: string) {
  const data = await fetchFromFMP(`profile/${symbol}`);
  return Array.isArray(data) ? data[0] : null;
}

// Shareholding (institutional ownership, etc.) – FMP has /institutional-holder/:symbol
export async function getShareholding(symbol: string) {
  const data = await fetchFromFMP(`institutional-holder/${symbol}`);
  return Array.isArray(data) ? data : [];
}

// Quarterly financials (income statement)
export async function getQuarterlyIncome(symbol: string, limit = 8) {
  const data = await fetchFromFMP(`income-statement/${symbol}?period=quarter&limit=${limit}`);
  return Array.isArray(data) ? data : [];
}

// Events (calendar)
export async function getEvents(symbol: string) {
  const data = await fetchFromFMP(`earning_calendar?symbol=${symbol}`);
  return data || [];
}

// Top mutual funds (FMP has /etf-holder/:symbol or /mutual-fund-holder/:symbol)
export async function getTopMutualFunds(symbol: string) {
  const data = await fetchFromFMP(`etf-holder/${symbol}`);
  return Array.isArray(data) ? data : [];
}

// Similar stocks (FMP has /stock_peers?symbol=...)
export async function getSimilarStocks(symbol: string) {
  const data = await fetchFromFMP(`stock_peers?symbol=${symbol}`);
  if (data && data.peersList) return data.peersList.split(',').slice(0, 8);
  return [];
}

// Technical indicators (RSI, MACD, etc.) – using FMP's technical endpoint
export async function getTechnicalData(symbol: string) {
  const rsi = await fetchFromFMP(`technical_indicator/1day/${symbol}?period=14&type=rsi`);
  const macd = await fetchFromFMP(`technical_indicator/1day/${symbol}?period=26&type=macd`);
  const beta = await fetchFromFMP(`beta/${symbol}`);
  return {
    rsi: Array.isArray(rsi) && rsi.length ? rsi[0].rsi : null,
    macd: Array.isArray(macd) && macd.length ? macd[0].macd : null,
    beta: beta ? beta.beta : null,
  };
}
