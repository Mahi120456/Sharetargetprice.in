const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function insertStocks() {
  const csvUrl = 'https://raw.githubusercontent.com/abhijitparida/stock-data/master/nse_eq_symbols.csv';
  const res = await axios.get(csvUrl);
  const lines = res.data.split('\n').slice(1);
  for (const line of lines) {
    const [symbol, name] = line.split(',');
    if (!symbol) continue;
    const slug = symbol.toLowerCase().replace(/&/g, '-');
    await supabase.from('stocks').upsert({ slug, name: name || symbol, symbol }, { onConflict: 'symbol' });
  }
  console.log('Done');
}
insertStocks();
