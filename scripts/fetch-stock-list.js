import { createClient } from '@supabase/supabase-js';
import nselib from 'nselib';
import yahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fetchNSEEquityList() {
  try {
    // Using nselib to get equity list
    const equityList = await nselib.equity.equityList();
    return equityList.map(item => ({
      symbol: item.symbol,
      name: item.companyName,
      isin: item.isin,
      sector: item.industry || null,
    }));
  } catch (error) {
    console.error('Error fetching NSE list:', error);
    return [];
  }
}

async function enrichWithYahoo(symbol) {
  try {
    const quote = await yahooFinance.quote(`${symbol}.NS`);
    return {
      current_price: quote.regularMarketPrice,
      market_cap: quote.marketCap ? quote.marketCap / 1e7 : null, // convert to crores
      pe_ratio: quote.trailingPE,
      roe: quote.returnOnEquity ? quote.returnOnEquity * 100 : null,
      // Yahoo doesn't give debt/equity directly, we'll get later from other sources
    };
  } catch (err) {
    return {};
  }
}

async function main() {
  console.log('Fetching NSE equity list...');
  let stocks = await fetchNSEEquityList();
  console.log(`Fetched ${stocks.length} stocks. Enriching with Yahoo data...`);

  // Limit to first 100 for testing, remove limit later
  for (let i = 0; i < Math.min(stocks.length, 100); i++) {
    const stock = stocks[i];
    const yahooData = await enrichWithYahoo(stock.symbol);
    Object.assign(stock, yahooData);
    
    // Insert/update in Supabase
    const { error } = await supabase
      .from('stocks_master')
      .upsert({
        symbol: stock.symbol,
        name: stock.name,
        isin: stock.isin,
        sector: stock.sector,
        current_price: stock.current_price,
        market_cap: stock.market_cap,
        pe_ratio: stock.pe_ratio,
        roe: stock.roe,
        is_manual: false,
        last_updated: new Date(),
      }, { onConflict: 'symbol' });
    
    if (error) console.error(`Error upserting ${stock.symbol}:`, error);
    else console.log(`✅ ${stock.symbol} added`);
    
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('Done!');
}

main();
