// scripts/insert-all-stocks.js
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY;

async function insertStocksFromUpstox() {
  if (!UPSTOX_API_KEY) {
    console.error('UPSTOX_API_KEY not set in environment');
    process.exit(1);
  }

  const url = 'https://api.upstox.com/v2/market/quote/instrument';
  const headers = {
    'Accept': 'application/json',
    'Api-Version': '2.0',
    'Authorization': `Bearer ${UPSTOX_API_KEY}`
  };

  try {
    const response = await axios.get(url, { headers });
    const instruments = response.data.data?.instruments || [];
    console.log(`Fetched ${instruments.length} instruments`);

    // Filter only equity (segment = 'EQ') for NSE and BSE
    const equityStocks = instruments.filter(instr => 
      (instr.exchange === 'NSE' || instr.exchange === 'BSE') &&
      instr.segment === 'EQ'
    );
    console.log(`Equity stocks count: ${equityStocks.length}`);

    let inserted = 0, errors = 0;

    for (const stock of equityStocks) {
      const symbol = stock.symbol;
      const name = stock.company_name || symbol;
      const exchange = stock.exchange;

      let slug = symbol.toLowerCase()
        .replace(/&/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      if (exchange === 'BSE') slug = `${slug}-bse`;

      const data = {
        slug,
        name,
        symbol,
        exchange,
        // All other columns will be filled later by daily update script
        current_price: null,
        market_cap: null,
        pe_ratio: null,
        eps: null,
        roe: null,
        roce: null,
        debt_to_equity: null,
        book_value: null,
        high52: null,
        low52: null,
        volume: null,
        target_2025: null,
        target_2028: null,
        target_2030: null,
        target_2035: null,
        target_2040: null,
        target_2045: null,
        target_2050: null,
        ai_analysis: null,
        content: null,
        last_updated: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('stocks')
        .upsert(data, { onConflict: 'symbol' });

      if (error) {
        console.error(`Error for ${symbol} (${exchange}):`, error.message);
        errors++;
      } else {
        inserted++;
        if (inserted % 100 === 0) console.log(`Processed ${inserted} stocks...`);
      }
    }

    console.log(`✅ Done. Inserted/Updated ${inserted} stocks. Errors: ${errors}`);
  } catch (err) {
    console.error('Failed to fetch from Upstox:', err.message);
    if (err.response) console.error('Response data:', err.response.data);
  }
}

insertStocksFromUpstox().catch(console.error);
