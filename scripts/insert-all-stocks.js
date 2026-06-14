// scripts/insert-all-stocks.js
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Reliable CSV source – contains both NSE & BSE stocks (~4,500+ symbols)
// Source: GitHub community maintained list (updated 2026)
const CSV_URL = 'https://raw.githubusercontent.com/architsharma25/Indian-Stocks-List/main/NSE_BSE_All_Stocks.csv';

async function insertAllStocks() {
  console.log('📥 Fetching NSE+BSE stock list from CSV...');
  
  try {
    const response = await axios.get(CSV_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    });
    
    const lines = response.data.split('\n');
    const headers = lines[0].split(',');
    
    // Find column indices (CSV has 'SYMBOL' and 'NAME OF COMPANY')
    const symbolIdx = headers.findIndex(h => h.toUpperCase().includes('SYMBOL'));
    const nameIdx = headers.findIndex(h => h.toUpperCase().includes('NAME'));
    
    if (symbolIdx === -1) {
      throw new Error('CSV format unexpected – symbol column not found');
    }
    
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      let symbol = parts[symbolIdx]?.trim();
      if (!symbol) continue;
      
      // Remove double quotes if present
      symbol = symbol.replace(/^"|"$/g, '');
      // Keep only alphanumeric (NSE/BSE symbols are letters)
      const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, '');
      if (cleanSymbol.length < 2) continue;
      
      let name = nameIdx !== -1 ? parts[nameIdx]?.trim().replace(/^"|"$/g, '') : cleanSymbol;
      const slug = cleanSymbol.toLowerCase();
      
      const { error } = await supabase
        .from('stocks')
        .upsert(
          { slug, name: name || cleanSymbol, symbol: cleanSymbol, sector: 'General' },
          { onConflict: 'symbol', ignoreDuplicates: true }
        );
      
      if (error && error.code !== '23505') {
        console.error(`Error for ${cleanSymbol}:`, error.message);
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
