const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function insertStocks() {
  // Get a session cookie from NSE homepage
  const homeUrl = 'https://www.nseindia.com';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  };
  let cookie = '';
  try {
    const homeRes = await axios.get(homeUrl, { headers });
    const setCookie = homeRes.headers['set-cookie'];
    if (setCookie) cookie = setCookie.map(c => c.split(';')[0]).join('; ');
  } catch (err) {
    console.error('Failed to get cookie:', err.message);
  }
  
  const apiUrl = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500';
  const apiHeaders = { ...headers, Cookie: cookie };
  try {
    const res = await axios.get(apiUrl, { headers: apiHeaders });
    const stocks = res.data.data;
    console.log(`Fetched ${stocks.length} stocks from NSE API`);
    let inserted = 0;
    for (const stock of stocks) {
      const symbol = stock.symbol;
      const name = stock.companyName || symbol;
      const slug = symbol.toLowerCase().replace(/&/g, '-');
      // Use simple insert (ignore duplicate errors)
      const { error } = await supabase.from('stocks').insert({ slug, name, symbol }).select();
      if (error && error.code === '23505') {
        // duplicate, skip
        console.log(`Skipping duplicate: ${symbol}`);
      } else if (error) {
        console.error(`Error for ${symbol}:`, error.message);
      } else {
        inserted++;
        if (inserted % 50 === 0) console.log(`Inserted ${inserted} stocks`);
      }
    }
    console.log(`✅ Done! Inserted ${inserted} new stocks.`);
  } catch (err) {
    console.error('API request failed:', err.message);
  }
}
insertStocks();
