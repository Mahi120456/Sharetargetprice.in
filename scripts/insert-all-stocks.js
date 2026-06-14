import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function createSlug(name, symbol) {
  const base = name || symbol;
  return base.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function fetchStocksFromGitHub() {
  console.log('📥 Fetching stock list from GitHub repository...');
  // Using a reliable GitHub repo that maintains combined NSE+BSE equity list
  const csvUrl = 'https://raw.githubusercontent.com/shubham9011/nse-bse-stock-list/main/stock_list.csv';
  // Alternative fallback if above fails
  const fallbackUrl = 'https://raw.githubusercontent.com/abhijitparida/stock-data/master/nse_eq_symbols.csv';
  
  let response;
  try {
    response = await axios.get(csvUrl, { timeout: 30000 });
    console.log('✅ Primary source working');
  } catch (err) {
    console.warn('Primary source failed, trying fallback...');
    try {
      response = await axios.get(fallbackUrl, { timeout: 30000 });
      console.log('✅ Fallback source working');
    } catch (fallbackErr) {
      throw new Error('Both sources failed');
    }
  }
  
  const lines = response.data.split('\n');
  const headers = lines[0].toLowerCase().split(',');
  // Find symbol and name columns
  let symbolIdx = headers.findIndex(h => h.includes('symbol') || h === 'symbol');
  let nameIdx = headers.findIndex(h => h.includes('name') || h === 'name' || h === 'company name');
  if (symbolIdx === -1) symbolIdx = 0;
  if (nameIdx === -1) nameIdx = 1;
  
  const stocks = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    let symbol = parts[symbolIdx]?.trim()?.replace(/"/g, '');
    let name = nameIdx !== -1 ? parts[nameIdx]?.trim()?.replace(/"/g, '') : symbol;
    if (!symbol || symbol === '' || symbol === 'SYMBOL') continue;
    // filter out indices, ETFs, etc.
    if (symbol.includes('ETF') || symbol.includes('NIFTY') || symbol.includes('BANKNIFTY') || symbol.includes('SGBN')) continue;
    if (symbol.startsWith('NIFTY') || symbol.startsWith('BANKNIFTY')) continue;
    stocks.push({
      symbol: symbol,
      name: name || symbol,
      slug: createSlug(name, symbol),
      sector: 'General',
    });
  }
  console.log(`✅ Fetched ${stocks.length} unique stocks`);
  return stocks;
}

async function insertStocks(stocks) {
  const BATCH_SIZE = 100;
  let inserted = 0, skipped = 0;
  for (let i = 0; i < stocks.length; i += BATCH_SIZE) {
    const batch = stocks.slice(i, i + BATCH_SIZE);
    console.log(`📝 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(stocks.length / BATCH_SIZE)}`);
    for (const stock of batch) {
      const { error } = await supabase
        .from('stocks')
        .upsert({
          slug: stock.slug,
          name: stock.name,
          symbol: stock.symbol,
          sector: stock.sector,
        }, { onConflict: 'symbol', ignoreDuplicates: true });
      if (error && error.code !== '23505') {
        console.error(`❌ Error for ${stock.symbol}:`, error.message);
        skipped++;
      } else {
        inserted++;
      }
    }
    console.log(`  ✅ Batch done. Inserted so far: ${inserted}, Skipped: ${skipped}`);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n🎉 Insert complete! New stocks: ${inserted}, Already existed: ${skipped}`);
  console.log(`📊 Total stocks now in database: ${inserted + skipped}`);
}

async function main() {
  console.log('🚀 Starting stock import from GitHub repository...\n');
  try {
    const stocks = await fetchStocksFromGitHub();
    if (stocks.length === 0) throw new Error('No stocks fetched');
    await insertStocks(stocks);
    console.log('\n✅ All stocks imported successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main().catch(console.error);
