import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function createSlug(name, symbol) {
  const base = name || symbol;
  return base.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function fetchAllNSEStocks() {
  console.log('📥 Fetching all NSE stocks...');
  const csvUrl = 'https://www.nseindia.com/static/market-data/securities-available-for-trading.csv';
  let cookie = '';

  try {
    const homeRes = await axios.get('https://www.nseindia.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
      }
    });
    const setCookie = homeRes.headers['set-cookie'];
    if (setCookie) cookie = setCookie.map(c => c.split(';')[0]).join('; ');
  } catch (err) {
    console.warn('Cookie fetch warning:', err.message);
  }

  try {
    const response = await axios.get(csvUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': cookie, 'Accept': 'text/csv' },
      timeout: 30000
    });
    
    const lines = response.data.split('\n');
    const headers = lines[0].toLowerCase().split(',');
    const symbolIdx = headers.findIndex(h => h.includes('symbol'));
    const nameIdx = headers.findIndex(h => h.includes('name'));
    
    const stocks = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      let symbol = parts[symbolIdx]?.trim()?.replace(/"/g, '');
      let name = nameIdx !== -1 ? parts[nameIdx]?.trim()?.replace(/"/g, '') : symbol;
      
      if (!symbol || symbol === 'SYMBOL') continue;
      if (symbol.includes('ETF') || symbol.includes('SGBN') || symbol.includes('NIFTY') || symbol.includes('BANKNIFTY')) continue;
      if (symbol.startsWith('NIFTY') || symbol.startsWith('BANKNIFTY')) continue;
      
      stocks.push({ symbol, name: name || symbol, slug: createSlug(name, symbol), sector: 'General', source: 'NSE' });
    }
    console.log(`✅ NSE: ${stocks.length} stocks fetched`);
    return stocks;
  } catch (err) {
    console.error('❌ NSE CSV fetch failed:', err.message);
    return [];
  }
}

async function fetchAllBSEStocks() {
  console.log('📥 Fetching all BSE stocks...');
  const csvUrl = 'https://raw.githubusercontent.com/utkarshkant/Indian-Stocks-List/main/List%20of%20Companies%20Listed%20in%20BSE%20(EQ).csv';
  
  try {
    const response = await axios.get(csvUrl, { timeout: 30000 });
    const lines = response.data.split('\n');
    const headers = lines[0].toLowerCase().split(',');
    const symbolIdx = headers.findIndex(h => h.includes('symbol'));
    const nameIdx = headers.findIndex(h => h.includes('name'));
    
    const stocks = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      let symbol = parts[symbolIdx]?.trim()?.replace(/"/g, '');
      let name = nameIdx !== -1 ? parts[nameIdx]?.trim()?.replace(/"/g, '') : symbol;
      
      if (!symbol || symbol === 'SYMBOL') continue;
      if (symbol.includes('ETF') || symbol.includes('NIFTY') || symbol.includes('BANKNIFTY')) continue;
      
      stocks.push({ symbol, name: name || symbol, slug: createSlug(name, symbol), sector: 'General', source: 'BSE' });
    }
    console.log(`✅ BSE: ${stocks.length} stocks fetched`);
    return stocks;
  } catch (err) {
    console.error('❌ BSE CSV fetch failed:', err.message);
    return [];
  }
}

function mergeStocks(nseStocks, bseStocks) {
  const map = new Map();
  nseStocks.forEach(stock => map.set(stock.symbol, stock));
  bseStocks.forEach(stock => { if (!map.has(stock.symbol)) map.set(stock.symbol, stock); });
  const merged = Array.from(map.values());
  console.log(`📊 Total unique stocks after merge: ${merged.length}`);
  return merged;
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
        .upsert({ slug: stock.slug, name: stock.name, symbol: stock.symbol, sector: stock.sector }, { onConflict: 'symbol', ignoreDuplicates: true });
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
  console.log('🚀 Starting full NSE + BSE stock import...\n');
  const nseStocks = await fetchAllNSEStocks();
  const bseStocks = await fetchAllBSEStocks();
  if (nseStocks.length === 0 && bseStocks.length === 0) {
    console.error('❌ No stocks fetched. Check internet or sources.');
    return;
  }
  const allStocks = mergeStocks(nseStocks, bseStocks);
  await insertStocks(allStocks);
  console.log('\n✅ All stocks imported successfully!');
}

main().catch(console.error);
