const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Headers for Yahoo Finance (to avoid 401)
const yahooHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

// Fetch 52-week high/low from Yahoo Finance chart endpoint
async function fetchYahoo52Week(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`;
    const res = await axios.get(url, { headers: yahooHeaders });
    const meta = res.data.chart.result[0]?.meta;
    return {
      high52: meta?.fiftyTwoWeekHigh || null,
      low52: meta?.fiftyTwoWeekLow || null,
    };
  } catch (err) {
    console.error(`Yahoo 52‑week error for ${symbol}:`, err.message);
    return { high52: null, low52: null };
  }
}

// Fetch fundamentals from Finnhub
async function fetchFinnhubData(symbol) {
  try {
    // Quote (current price, daily high/low, volume)
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const quoteRes = await axios.get(quoteUrl);
    const quote = quoteRes.data;

    // Company profile (market cap)
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const profileRes = await axios.get(profileUrl);
    const profile = profileRes.data;

    // Financial metrics (ROE, ROCE, dividend yield, debt/equity, book value, P/E, EPS)
    const metricsUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`;
    const metricsRes = await axios.get(metricsUrl);
    const metrics = metricsRes.data.metric || {};

    // 52-week from Yahoo
    const yahoo52 = await fetchYahoo52Week(symbol);

    const data = {
      current_price: quote.c || null,
      pe_ratio: metrics.peBasicExclExtraTTM || null,
      eps: metrics.epsBasicExclExtraTTM || null,
      market_cap: profile.marketCapitalization || null,
      high52: yahoo52.high52,
      low52: yahoo52.low52,
      volume: quote.v || null,
      roe: metrics.roeTTM ? (metrics.roeTTM * 100).toFixed(2) : null,
      roce: metrics.roceTTM ? (metrics.roceTTM * 100).toFixed(2) : null,
      dividend_yield: metrics.dividendYieldIndicatedYear ? (metrics.dividendYieldIndicatedYear * 100).toFixed(2) : null,
      debt_to_equity: metrics.totalDebtToEquityAnnual || null,
      book_value: metrics.bookValuePerShareAnnual || null,
      last_updated: new Date().toISOString(),
    };
    return data;
  } catch (err) {
    console.error(`Finnhub error for ${symbol}:`, err.message);
    return null;
  }
}

async function updateAllStocks() {
  const { data: stocks } = await supabase.from('stocks').select('symbol, id');
  if (!stocks) return;
  console.log(`Found ${stocks.length} stocks.`);

  let updated = 0;
  for (const stock of stocks) {
    const data = await fetchFinnhubData(stock.symbol);
    if (data) {
      const { error } = await supabase.from('stocks').update(data).eq('id', stock.id);
      if (error) {
        console.error(`Update error for ${stock.symbol}:`, error.message);
      } else {
        console.log(`✅ Updated ${stock.symbol}`, data);
        updated++;
      }
    } else {
      console.error(`❌ Failed for ${stock.symbol}`);
    }
    await new Promise(r => setTimeout(r, 1000)); // respect Finnhub rate limit (60/min)
  }
  console.log(`Complete: Updated ${updated} of ${stocks.length}`);
}
updateAllStocks().catch(console.error);
