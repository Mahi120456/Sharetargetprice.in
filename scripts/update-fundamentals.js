const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fetchStockData(symbol) {
  const yahooSymbol = `${symbol}.NS`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
  try {
    const response = await axios.get(url);
    const result = response.data.chart.result[0];
    if (!result) return null;
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const price = meta.regularMarketPrice;
    const trailingPE = meta.trailingPE || null;
    const eps = meta.epsCurrentYear || meta.epsTrailingTwelveMonths || null;
    const high52 = meta.fiftyTwoWeekHigh || null;
    const low52 = meta.fiftyTwoWeekLow || null;
    const marketCap = meta.marketCap || null;
    const volume = quote.volume ? quote.volume[0] : null;
    // ROE and dividend yield not directly available in this endpoint, but we can get from other endpoints if needed.
    // For now, keep null.
    return {
      pe_ratio: trailingPE,
      eps: eps,
      market_cap: marketCap,
      high52: high52,
      low52: low52,
      current_price: price,
      volume: volume,
      // ROE and dividend_yield will stay null for now (they require other API calls)
    };
  } catch (err) {
    console.error(`Fetch error for ${symbol}: ${err.message}`);
    return null;
  }
}

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
    const data = await fetchStockData(symbol);
    if (data) {
      const { error: updateError } = await supabase
        .from('stocks')
        .update({
          pe_ratio: data.pe_ratio,
          eps: data.eps,
          market_cap: data.market_cap,
          high52: data.high52,
          low52: data.low52,
          current_price: data.current_price,
          volume: data.volume,
          last_updated: new Date().toISOString(),
        })
        .eq('id', stock.id);
      if (updateError) {
        console.error(`Update error for ${symbol}:`, updateError.message);
        failed++;
      } else {
        console.log(`✅ Updated ${symbol}`);
        updated++;
      }
    } else {
      console.error(`❌ Failed to fetch ${symbol}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`Complete: Updated ${updated}, Failed ${failed}, Total ${stocks.length}`);
}

updateAllStocks().catch(console.error);
