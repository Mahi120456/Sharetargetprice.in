import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import csv from 'csv-parser';
import { Readable } from 'stream';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const NSE_CSV_URL =
  'https://archives.nseindia.com/content/equities/EQUITY_L.csv';

async function downloadNSEStocks() {
  const response = await axios.get(NSE_CSV_URL, {
    responseType: 'text',
    timeout: 30000,
  });

  return new Promise((resolve, reject) => {
    const results = [];

    Readable.from(response.data)
      .pipe(csv())
      .on('data', (row) => {
        const symbol = row['SYMBOL']?.trim();
        const name = row['NAME OF COMPANY']?.trim();

        if (symbol) {
          results.push({
            symbol,
            name,
          });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function main() {
  try {
    console.log('Downloading NSE stock list...');

    const stocks = await downloadNSEStocks();

    console.log(`Found ${stocks.length} stocks`);

    let inserted = 0;
    let errors = 0;

    for (const stock of stocks) {
      const slug = stock.symbol
        .toLowerCase()
        .replace(/&/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const { error } = await supabase
        .from('stocks')
        .upsert(
          {
            symbol: stock.symbol,
            name: stock.name,
            exchange: 'NSE',
            slug,
            last_updated: new Date().toISOString(),
          },
          {
            onConflict: 'symbol',
          }
        );

      if (error) {
        errors++;
        console.error(`❌ ${stock.symbol}: ${error.message}`);
      } else {
        inserted++;
      }

      if (inserted % 100 === 0) {
        console.log(`✅ Inserted ${inserted}`);
      }
    }

    console.log('====================');
    console.log(`Total Stocks: ${stocks.length}`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Errors: ${errors}`);
    console.log('🎉 Import Complete');
  } catch (err) {
    console.error('FAILED:', err.message);

    if (err.response) {
      console.error(err.response.status);
      console.error(err.response.data);
    }

    process.exit(1);
  }
}

main();
