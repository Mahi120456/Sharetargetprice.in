const { createClient } = require('@supabase/supabase-js');
const yahooFinance = require('yahoo-finance2');   // ✅ No `.default`, no `new`

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fetchStockData(symbol) {
  try {
    const quote = await yahooFinance.quote(`${symbol}.NS`);
    // Additional fundamentals can be fetched via quoteSummary
    const summary = await yahooFinance.quoteSummary(`${symbol}.NS`, { modules: ['financialData', 'defaultKeyStatistics'] });
    const finData = summary.financialData || {};
    const keyStats = summary.defaultKeyStatistics || {};

    return {
      current_price: quote.regularMarketPrice || null,
      pe_ratio: quote.trailingPE || null,
      eps: quote.epsTrailingTwelveMonths || null,
      market_cap: quote.marketCap || null,
      high52: quote.fiftyTwoWeekHigh || null,
      low52: quote.fiftyTwoWeekLow || null,
      volume: quote.regularMarketVolume || null,
      roe: finData.returnOnEquity ? (finData.returnOnEquity * 100).toFixed(2) : null,
      roce: finData.returnOnAssets ? (finData.returnOnAssets * 100).toFixed(2) : null,
      dividend_yield: finData.dividendYield ? (finData.dividendYield * 100).toFixed(2) : null,
      debt_to_equity: finData.totalDebt ? (finData.totalDebt / keyStats.totalShareholderEquity) : null,
      book_value: keyStats.bookValue || null,
      last_updated: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`Fetch error for ${symbol}:`, err.message);
    return null;
  }
}

async function updateAllStocks() {
  const { data: stocks } = await supabase.from('stocks').select('symbol, id');
  if (!stocks) return;
  console.log(`Found ${stocks.length} stocks.`);

  let updated = 0;
  for (const stock of stocks) {
    const data = await fetchStockData(stock.symbol);
    if (data) {
      const { error } = await supabase.from('stocks').update(data).eq('id', stock.id);
      if (error) console.error(`Update error for ${stock.symbol}:`, error.message);
      else {
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
