// scripts/insert-all-stocks.js
import { createClient } from '@supabase/supabase-js';
import { NseIndia } from 'stock-nse-india';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function insertAllStocks() {
  console.log('📥 Fetching all NSE stocks using stock-nse-india...');
  
  try {
    const nseIndia = new NseIndia();
    // Fetch all equity symbols (no API key required)
    const symbols = await nseIndia.getAllStockSymbols();
    console.log(`✅ Total symbols fetched: ${symbols.length}`);
    
    let inserted = 0;
    let skipped = 0;
    
    for (const symbol of symbols) {
      // Clean symbol (remove special characters)
      const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, '');
      if (!cleanSymbol || cleanSymbol.length < 2) continue;
      
      const slug = cleanSymbol.toLowerCase();
      const name = cleanSymbol; // you can later update names from another source
      
      const { error } = await supabase
        .from('stocks')
        .upsert(
          { slug, name, symbol: cleanSymbol, sector: 'General' },
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
