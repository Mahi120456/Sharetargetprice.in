import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { Readable } from 'stream';
import csv from 'csv-parser';
import 'dotenv/config';

const gunzip = promisify(zlib.gunzip);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fetchAndInsertStocks() {
  console.log('📥 Fetching stock list from Upstox public CSV...');
  const url = 'https://assets.upstox.com/market-quote/instruments/exchange/complete.csv.gz';
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const csvBuffer = await gunzip(response.data);
    const records = [];
    await new Promise((resolve, reject) => {
      const readable = Readable.from(csvBuffer.toString());
      readable
        .pipe(csv())
        .on('data', (data) => records.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    let inserted = 0, skipped = 0;
    console.log(`✅ Total records: ${records.length}`);

    for (const record of records) {
      if (record.segment === 'NSE_EQ' || record.segment === 'BSE_EQ') {
        let symbol = record.trading_symbol;
        if (!symbol) continue;
        const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, '');
        if (cleanSymbol.length < 2) continue;
        const slug = cleanSymbol.toLowerCase();
        const name = record.name || cleanSymbol;
        const { error } = await supabase
          .from('stocks')
          .upsert({ slug, name, symbol: cleanSymbol, sector: 'General' }, { onConflict: 'symbol', ignoreDuplicates: true });
        if (error && error.code !== '23505') {
          console.error(`Error for ${cleanSymbol}:`, error.message);
          skipped++;
        } else if (!error) {
          inserted++;
          if (inserted % 100 === 0) console.log(`✅ Inserted ${inserted} stocks...`);
        }
      }
    }
    console.log(`\n🎉 Done! Inserted ${inserted} new stocks. Skipped ${skipped} duplicates.`);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

fetchAndInsertStocks();
