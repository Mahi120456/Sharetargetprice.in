// scripts/insert-all-stocks.js
// Run: node scripts/insert-all-stocks.js
// One-time script to insert all NSE+BSE stocks

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function insertAllStocks() {
  console.log('📥 Fetching stock list from Dhan.co...');
  
  try {
    // 🔥 New CSV URL – All NSE + BSE stocks
    const csvUrl = 'https://dhan.co/all-stocks-list/';
    
    // Note: Dhan page is HTML, we need to fetch the CSV directly.
    // If Dhan CSV doesn't work, use this alternative:
    // const csvUrl = 'https://raw.githubusercontent.com/architsharma25/Indian-Stocks-List/main/NSE_BSE_All_Stocks.csv';
    
    const response = await axios.get(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Parse CSV content from the response
    const lines = response.data.split('\n');
    const headers = lines[0].split(',');
    
    // Find column indices (Dhan's CSV has different columns)
    const symbolIndex = headers.findIndex(h => 
      h.toLowerCase().includes('symbol') || h.toLowerCase().includes('scrip')
    );
    const nameIndex = headers.findIndex(h => 
      h.toLowerCase().includes('name') || h.toLowerCase().includes('company')
    );
    
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      let symbol = symbolIndex !== -1 ? parts[symbolIndex]?.trim() : parts[0]?.trim();
      let name = nameIndex !== -1 ? parts[nameIndex]?.trim() : symbol;
      
      if (!symbol || symbol === 'Symbol' || symbol === '') continue;
      
      // Clean symbol (remove special characters, spaces)
      symbol = symbol.replace(/[^A-Za-z0-9]/g, '');
      if (symbol.length < 2) continue;
      
      const slug = symbol.toLowerCase().replace(/&/g, '-');
      
      // Insert or skip if exists
      const { error } = await supabase
        .from('stocks')
        .upsert(
          { slug, name: name || symbol, symbol, sector: 'General' },
          { onConflict: 'symbol', ignoreDuplicates: true }
        );
      
      if (error && error.code !== '23505') {
        console.error(`Error for ${symbol}:`, error.message);
        skipped++;
      } else {
        inserted++;
        if (inserted % 100 === 0) console.log(`✅ Inserted ${inserted} stocks...`);
      }
    }
    
    console.log(`\n🎉 Done! Inserted ${inserted} new stocks. Skipped ${skipped} duplicates.`);
    
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

insertAllStocks().catch(console.error);
