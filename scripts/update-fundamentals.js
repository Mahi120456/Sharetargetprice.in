const { createClient } = require('@supabase/supabase-js');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance(); // 👈 Important: Create an instance!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fetchStockData(symbol) {
  try {
    const quote = await yahooFinance.quote(`${symbol}.NS`);
    return {
      current_price: quote.regularMarketPrice || null,
      pe_ratio: quote.trailingPE || null,
      eps: quote.epsTrailingTwelveMonths || null,
      market_cap: quote.marketCap || null,
      high52: quote.fiftyTwoWeekHigh || null,
      low52: quote.fiftyTwoWeekLow || null,
      volume: quote.regularMarketVolume || null,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

async function updateAllStocks() {
  const { data: stocks } = await supabase.from('stocks').select('symbol, id');
  if (!stocks) return;

  console.log(`Found ${stocks.length} stocks. Starting update...`);

  let updated = 0;
  for (const stock of stocks) {
    const symbol = stock.symbol;
    const data = await fetchStockData(symbol);
    if (data) {
      const { error } = await supabase.from('stocks').update(data).eq('id', stock.id);
      if (error) {
        console.error(`Update error for ${symbol}:`, error.message);
      } else {
        console.log(`✅ Updated ${symbol}`);
        updated++;
      }
    } else {
      console.error(`❌ Failed to fetch ${symbol}`);
    }
    await new Promise(r => setTimeout(r, 1000)); // Rate limiting
  }
  console.log(`Complete: Updated ${updated} out of ${stocks.length}`);
}

updateAllStocks().catch(console.error);
