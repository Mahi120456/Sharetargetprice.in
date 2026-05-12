const { createClient } = require('@supabase/supabase-js');
const yahooFinance = require('yahoo-finance2').default;   // ✅ No ES modules

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateAllStocks() {
  const { data: stocks } = await supabase.from('stocks').select('symbol, id');
  if (!stocks) return;
  console.log(`Found ${stocks.length} stocks.`);

  let updated = 0;
  for (const stock of stocks) {
    try {
      const symbol = stock.symbol;
      const quote = await yahooFinance.quote(`${symbol}.NS`);
      const summary = await yahooFinance.quoteSummary(`${symbol}.NS`, {
        modules: ['financialData', 'defaultKeyStatistics']
      });
      const fin = summary.financialData || {};
      const stats = summary.defaultKeyStatistics || {};

      const data = {
        current_price: quote.regularMarketPrice || null,
        pe_ratio: quote.trailingPE || null,
        eps: quote.epsTrailingTwelveMonths || null,
        market_cap: quote.marketCap || null,
        high52: quote.fiftyTwoWeekHigh || null,
        low52: quote.fiftyTwoWeekLow || null,
        volume: quote.regularMarketVolume || null,
        roe: fin.returnOnEquity ? (fin.returnOnEquity * 100).toFixed(2) : null,
        roce: fin.returnOnAssets ? (fin.returnOnAssets * 100).toFixed(2) : null,
        dividend_yield: fin.dividendYield ? (fin.dividendYield * 100).toFixed(2) : null,
        debt_to_equity: fin.totalDebt && stats.totalShareholderEquity ? (fin.totalDebt / stats.totalShareholderEquity).toFixed(2) : null,
        book_value: stats.bookValue || null,
        last_updated: new Date().toISOString(),
      };

      const { error } = await supabase.from('stocks').update(data).eq('id', stock.id);
      if (error) console.error(`Update error for ${symbol}:`, error.message);
      else {
        console.log(`✅ Updated ${symbol}`);
        updated++;
      }
    } catch (err) {
      console.error(`❌ Failed for ${stock.symbol}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`Complete: Updated ${updated} of ${stocks.length}`);
}
updateAllStocks().catch(console.error);
