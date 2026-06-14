// scripts/insert-all-stocks.js
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function insertAllStocks() {
  console.log('📥 Fetching stock list from reliable NSE CSV...');
  
  // ✅ Working CSV – NSE equity symbols (maintained by community)
  const csvUrl = 'https://raw.githubusercontent.com/abhijitparida/stock-data/master/nse_eq_symbols.csv';
  
  try {
    const response = await axios.get(csvUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const lines = response.data.split('\n');
    const headers = lines[0].split(',');
    
    // Find columns
    const symbolIdx = headers.findIndex(h => h.toLowerCase().includes('symbol'));
    const nameIdx = headers.findIndex(h => h.toLowerCase().includes('name'));
    
    if (symbolIdx === -1) throw new Error('Symbol column not found');
    
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      let symbol = parts[symbolIdx]?.trim();
      if (!symbol) continue;
      
      let name = nameIdx !== -1 ? parts[nameIdx]?.trim() : symbol;
      
      // Clean symbol (keep only alphanumeric)
      symbol = symbol.replace(/[^A-Za-z0-9]/g, '');
      if (symbol.length < 2) continue;
      
      const slug = symbol.toLowerCase();
      
      const { error } = await supabase
        .from('stocks')
        .upsert(
          { slug, name: name || symbol, symbol, sector: 'General' },
          { onConflict: 'symbol', ignoreDuplicates: true }
        );
      
      if (error && error.code !== '23505') {
        console.error(`Error for ${symbol}:`, error.message);
        skipped++;
      } else if (!error) {
        inserted++;
        if (inserted % 100 === 0) console.log(`✅ Inserted ${inserted} stocks...`);
      }
    }
    
    console.log(`\n🎉 Done! Inserted ${inserted} new stocks. Skipped ${skipped} duplicates.`);
    
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

insertAllStocks();
