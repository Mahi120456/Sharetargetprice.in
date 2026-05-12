const { createClient } = require('@supabase/supabase-js');
const yahooFinance = require('yahoo-finance2');

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
  console.log(`Found ${stocks.length} stocks.`);

  let updated = 0;
  let failed = 0;

  for (const stock of stocks) {
    const symbol = stock.symbol;
    try {
      // Yahoo Finance symbol format for NSE: .NS
      const quote = await yahooFinance.quote(`${symbol}.NS`);
      
      const updateData = {
        current_price: quote.regularMarketPrice || null,
        pe_ratio: quote.trailingPE || null,
        eps: quote.epsTrailingTwelveMonths || null,
        roe: quote.returnOnEquity ? (quote.returnOnEquity * 100).toFixed(2) : null,
        dividend_yield: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : null,
        debt_to_equity: quote.debtToEquity || null,
        market_cap: quote.marketCap || null,
        high52: quote.fiftyTwoWeekHigh || null,
        low52: quote.fiftyTwoWeekLow || null,
        volume: quote.regularMarketVolume || null,
        last_updated: new Date().toISOString(),
      };
      
      // ROCE not directly available from Yahoo, we can leave as null for now
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
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`Complete: Updated ${updated}, Failed ${failed}`);
}

updateAllStocks().catch(console.error);
