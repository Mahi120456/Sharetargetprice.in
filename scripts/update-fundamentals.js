const { createClient } = require('@supabase/supabase-js');
const yahooFinance = require('yahoo-finance2').default;
const WebSocket = require('ws'); // 👈 add this line

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: {
      params: {
        ws: WebSocket  // 👈 pass WebSocket constructor
      }
    }
  }
);

async function updateAllStocks() {
  const { data: stocks } = await supabase.from('stocks').select('symbol, id');
  if (!stocks) return;

  for (const stock of stocks) {
    try {
      const quote = await yahooFinance.quote(`${stock.symbol}.NS`);
      await supabase.from('stocks').update({
        pe_ratio: quote.trailingPE || null,
        roe: quote.returnOnEquity ? (quote.returnOnEquity * 100) : null,
        eps: quote.epsTrailingTwelveMonths || null,
        dividend_yield: quote.dividendYield ? (quote.dividendYield * 100) : null,
        market_cap: quote.marketCap || null,
        high52: quote.fiftyTwoWeekHigh || null,
        low52: quote.fiftyTwoWeekLow || null,
        current_price: quote.regularMarketPrice || null,
        last_updated: new Date().toISOString(),
      }).eq('id', stock.id);
      console.log(`Updated ${stock.symbol}`);
    } catch(e) {
      console.error(`Error updating ${stock.symbol}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('Update complete');
}

updateAllStocks().catch(console.error);
