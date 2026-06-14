// scripts/insert-all-stocks.js
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function insertAllStocks() {
  console.log('📥 Fetching stock list from GitHub CSV...');
  
  // Reliable CSV source (NSE + BSE listed stocks, maintained by community)
  const csvUrl = 'https://raw.githubusercontent.com/architsharma25/Indian-Stocks-List/main/NSE_BSE_All_Stocks.csv';
  
  try {
    const response = await axios.get(csvUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const lines = response.data.split('\n');
    const headers = lines[0].split(',');
    
    const symbolIdx = headers.findIndex(h => h.toLowerCase().includes('symbol'));
    const nameIdx = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('company'));
    
    if (symbolIdx === -1) throw new Error('Symbol column not found in CSV');
    
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
