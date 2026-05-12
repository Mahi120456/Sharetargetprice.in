const { createClient } = require('@supabase/supabase-js');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

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
      // ROE (Return on Equity) as percentage
      roe: quote.returnOnEquity ? (quote.returnOnEquity * 100).toFixed(2) : null,
      // ROCE approximated using returnOnAssets (can be improved later)
      roce: quote.returnOnAssets ? (quote.returnOnAssets * 100).toFixed(2) : null,
      dividend_yield: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : null,
      debt_to_equity: quote.debtToEquity || null,
      // Book value per share (Yahoo Finance provides 'bookValue')
      book_value: quote.bookValue || null,
      // Face value not directly available in quote; can use 'sharesOutstanding' and 'marketCap'? No. We'll leave null or get from another API.
      // For now, leave face_value as null or manually update later.
      face_value: quote.faceValue || null, // Yahoo Finance sometimes has 'faceValue'?
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
      // Remove undefined fields (like face_value if not available)
      const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const { error } = await supabase.from('stocks').update(cleanData).eq('id', stock.id);
      if (error) {
        console.error(`Update error for ${symbol}:`, error.message);
      } else {
        console.log(`✅ Updated ${symbol}`, cleanData);
        updated++;
      }
    } else {
      console.error(`❌ Failed to fetch ${symbol}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`Complete: Updated ${updated} out of ${stocks.length}`);
}

updateAllStocks().catch(console.error);
