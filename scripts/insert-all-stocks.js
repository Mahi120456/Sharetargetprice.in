import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function createSlug(name, symbol) {
  const base = name || symbol;
  return base.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

// ========== NSE STOCKS via Official API ==========
async function fetchNSEStocks() {
  console.log('📥 Fetching NSE stocks via official API...');
  // Get session cookie first
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
    // NSE's master equity list API (returns all listed equities)
    const apiUrl = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500';
    // But this only gives 500 stocks. We need all equities. Use a different endpoint?
    // Actually, NSE has an endpoint for all securities: https://www.nseindia.com/api/equity-list
    // Let's try that
    const allEquityUrl = 'https://www.nseindia.com/api/equity-list';
    const res = await axios.get(allEquityUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': cookie }
    });
    const stocks = res.data;
    console.log(`✅ NSE: ${stocks.length} stocks fetched`);
    return stocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.companyName || stock.symbol,
      slug: createSlug(stock.companyName, stock.symbol),
      sector: 'General',
      source: 'NSE'
    }));
  } catch (err) {
    console.error('❌ NSE API failed:', err.message);
    // Fallback to static list from GitHub
    return await fetchNSEFallback();
  }
}

async function fetchNSEFallback() {
  console.log('🔄 Using NSE fallback CSV...');
  const url = 'https://raw.githubusercontent.com/utkarshkant/Indian-Stocks-List/main/List%20of%20Companies%20Listed%20in%20NSE%20(EQ).csv';
  try {
    const response = await axios.get(url, { timeout: 30000 });
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
      if (symbol.includes('ETF') || symbol.includes('SGBN')) continue;
      stocks.push({
        symbol: symbol,
        name: name || symbol,
        slug: createSlug(name, symbol),
        sector: 'General',
        source: 'NSE_fallback'
      });
    }
    console.log(`✅ NSE fallback: ${stocks.length} stocks`);
    return stocks;
  } catch (err) {
    console.error('❌ NSE fallback also failed:', err.message);
    return [];
  }
}

// ========== BSE STOCKS via GitHub CSV ==========
async function fetchBSEStocks() {
  console.log('📥 Fetching BSE stocks...');
  const urls = [
    'https://raw.githubusercontent.com/utkarshkant/Indian-Stocks-List/main/List%20of%20Companies%20Listed%20in%20BSE%20(EQ).csv',
    'https://raw.githubusercontent.com/shubham9011/nse-bse-stock-list/main/stock_list.csv'
  ];
  for (const url of urls) {
    try {
      const response = await axios.get(url, { timeout: 30000 });
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
        if (symbol.includes('ETF') || symbol.includes('SGBN')) continue;
        stocks.push({
          symbol: symbol,
          name: name || symbol,
          slug: createSlug(name, symbol),
          sector: 'General',
          source: 'BSE'
        });
      }
      console.log(`✅ BSE: ${stocks.length} stocks fetched from ${url.split('/')[5]}`);
      return stocks;
    } catch (err) {
      console.warn(`BSE source failed: ${url}`);
    }
  }
  console.error('❌ All BSE sources failed');
  return [];
}

// ========== MERGE & INSERT ==========
function mergeStocks(nseStocks, bseStocks) {
  const map = new Map();
  nseStocks.forEach(stock => map.set(stock.symbol, stock));
  bseStocks.forEach(stock => {
    if (!map.has(stock.symbol)) map.set(stock.symbol, stock);
  });
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
  console.log('🚀 Starting stock import (NSE official + BSE fallback)...\n');
  const nseStocks = await fetchNSEStocks();
  const bseStocks = await fetchBSEStocks();
  if (nseStocks.length === 0 && bseStocks.length === 0) {
    console.error('❌ No stocks fetched. Exiting.');
    process.exit(1);
  }
  const allStocks = mergeStocks(nseStocks, bseStocks);
  await insertStocks(allStocks);
  console.log('\n✅ Import completed.');
}

main().catch(console.error);
