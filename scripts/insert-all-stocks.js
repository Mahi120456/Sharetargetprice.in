const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function insertStocks() {
  // Use a working CSV source (NSE equity list from dhruv-patel/NSE-data repository)
  const csvUrl = 'https://raw.githubusercontent.com/dhruv-patel/NSE-data/master/equity_list.csv';
  try {
    const response = await axios.get(csvUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const csvData = response.data;
    const lines = csvData.split('\n').slice(1); // skip header
    let count = 0;
    for (const line of lines) {
      const columns = line.split(',');
      const symbol = columns[0]?.trim();
      const name = columns[1]?.trim() || symbol;
      if (!symbol) continue;
      const slug = symbol.toLowerCase().replace(/&/g, '-');
      // Upsert: insert if not exists, update if symbol already there (but we keep existing)
      const { error } = await supabase.from('stocks').upsert(
        { slug, name: name || symbol, symbol },
        { onConflict: 'symbol', ignoreDuplicates: true }
      );
      if (error) console.error(`Error for ${symbol}:`, error.message);
      else count++;
      if (count % 100 === 0) console.log(`Inserted ${count} stocks so far`);
    }
    console.log(`✅ Done! Inserted/updated ${count} stocks.`);
  } catch (err) {
    console.error('Failed to fetch or insert stocks:', err.message);
  }
}
insertStocks();
