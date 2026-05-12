const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function insertStocks() {
  const csvUrl = 'https://raw.githubusercontent.com/dhruv-patel/NSE-data/master/equity_list.csv';
  try {
    const response = await axios.get(csvUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const lines = response.data.split('\n');
    const header = lines[0].split(',');
    const symbolIdx = header.findIndex(h => h.toLowerCase().includes('symbol'));
    const nameIdx = header.findIndex(h => h.toLowerCase().includes('name'));
    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      let symbol = symbolIdx !== -1 ? parts[symbolIdx]?.trim() : parts[0]?.trim();
      if (!symbol) continue;
      let name = nameIdx !== -1 ? parts[nameIdx]?.trim() : symbol;
      const slug = symbol.toLowerCase().replace(/&/g, '-');
      // Use simple insert (ignore conflicts) because we already have a unique constraint
      const { error } = await supabase.from('stocks').insert({ slug, name, symbol }).select();
      if (error && error.code === '23505') {
        // duplicate key, skip
        console.log(`Skipping duplicate: ${symbol}`);
      } else if (error) {
        console.error(`Error for ${symbol}:`, error.message);
      } else {
        count++;
        if (count % 100 === 0) console.log(`Inserted ${count} stocks`);
      }
    }
    console.log(`✅ Done! Inserted ${count} new stocks.`);
  } catch (err) {
    console.error('Failed:', err.message);
  }
}
insertStocks();
