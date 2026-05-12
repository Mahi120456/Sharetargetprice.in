const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchYahooData(symbol) {
  const yahooSymbol = `${symbol}.NS`;
  try {
    // Chart endpoint for price, 52w, volume, etc.
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
    const chartRes = await axios.get(chartUrl, { headers });
    const chart = chartRes.data.chart.result[0];
    const meta = chart.meta;
    const quote = chart.indicators.quote[0];

    // QuoteSummary for fundamentals (ROE, debt, etc.)
    const summaryUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=financialData,defaultKeyStatistics`;
    const summaryRes = await axios.get(summaryUrl, { headers });
    const summary = summaryRes.data.quoteSummary?.result?.[0];
    const finData = summary?.financialData || {};
    const keyStats = summary?.defaultKeyStatistics || {};

    return {
      current_price: meta.regularMarketPrice || null,
      pe_ratio: meta.trailingPE || null,
      eps: keyStats.epsTrailingTwelveMonths?.raw || null,
      market_cap: meta.marketCap || null,
      high52: meta.fiftyTwoWeekHigh || null,
      low52: meta.fiftyTwoWeekLow || null,
      volume: quote.volume?.[0] || null,
      roe: finData.returnOnEquity?.raw ? (finData.returnOnEquity.raw * 100).toFixed(2) : null,
      roce: finData.returnOnAssets?.raw ? (finData.returnOnAssets.raw * 100).toFixed(2) : null,
      dividend_yield: finData.dividendYield?.raw ? (finData.dividendYield.raw * 100).toFixed(2) : null,
      debt_to_equity: finData.totalDebt?.raw && keyStats.totalShareholderEquity?.raw ? (finData.totalDebt.raw / keyStats.totalShareholderEquity.raw) : null,
      book_value: keyStats.bookValue?.raw || null,
      last_updated: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`Fetch error for ${symbol}: ${err.message}`);
    return null;
  }
}

async function updateAllStocks() {
  const { data: stocks } = await supabase.from('stocks').select('symbol, id');
  if (!stocks) return;
  console.log(`Found ${stocks.length} stocks.`);

  let updated = 0;
  for (const stock of stocks) {
    const data = await fetchYahooData(stock.symbol);
    if (data) {
      const { error } = await supabase.from('stocks').update(data).eq('id', stock.id);
      if (error) {
        console.error(`Update error for ${stock.symbol}:`, error.message);
      } else {
        console.log(`✅ Updated ${stock.symbol}`);
        updated++;
      }
    } else {
      console.error(`❌ Failed for ${stock.symbol}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`Complete: Updated ${updated} of ${stocks.length}`);
}
updateAllStocks().catch(console.error);
