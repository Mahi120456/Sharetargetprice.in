const { createClient } = require('@supabase/supabase-js');
const yahooFinance = require('yahoo-finance2').default;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateAllStocks() {
  const { data: stocks, error } = await supabase
    .from('stocks')
    .select('symbol, id');
  
  if (error) {
    console.error('Error fetching stocks:', error.message);
    return;
  }
  if (!stocks || stocks.length === 0) {
    console.log('No stocks found in database.');
    return;
  }
  console.log(`Found ${stocks.length} stocks. Starting update...`);

  let updated = 0;
  let failed = 0;

  for (const stock of stocks) {
    const symbol = stock.symbol;
    try {
      const quote = await yahooFinance.quote(`${symbol}.NS`);
      const updateData = {
        pe_ratio: quote.trailingPE || null,
        roe: quote.returnOnEquity ? (quote.returnOnEquity * 100).toFixed(2) : null,
        eps: quote.epsTrailingTwelveMonths || null,
        dividend_yield: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : null,
        market_cap: quote.marketCap || null,
        high52: quote.fiftyTwoWeekHigh || null,
        low52: quote.fiftyTwoWeekLow || null,
        current_price: quote.regularMarketPrice || null,
        last_updated: new Date().toISOString(),
      };
      const { error: updateError } = await supabase
        .from('stocks')
        .update(updateData)
        .eq('id', stock.id);
      
      if (updateError) {
        console.error(`Update error for ${symbol}:`, updateError.message);
        failed++;
      } else {
        console.log(`✅ Updated ${symbol}`);
        updated++;
      }
    } catch (err) {
      console.error(`❌ Failed for ${symbol}:`, err.message);
      failed++;
    }
    await new Promise(r => setTimeout(r, 1000)); // rate limit
  }
  console.log(`Complete: Updated ${updated}, Failed ${failed}, Total ${stocks.length}`);
}

updateAllStocks().catch(console.error);
