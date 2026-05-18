import { supabase } from './supabase';

// Kitne hours tak data fresh maana jaaye
const CACHE_VALID_HOURS = 24;

export async function getStockData(slug: string) {
  // 1. Supabase se stock data lo
  const { data: stock, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !stock) {
    return null;
  }

  // 2. Check karo ki data kitna purana hai
  const lastUpdated = new Date(stock.last_updated);
  const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

  // Agar data 24 hours ke andar update hua hai to cache se hi return karo
  if (hoursSinceUpdate < CACHE_VALID_HOURS) {
    return stock;
  }

  // 3. Data purana hai → fresh data fetch karne ki koshish karo
  try {
    // Yahan hum baad mein FMP + Yahoo se data fetch karenge
    // Abhi ke liye sirf last_updated update kar rahe hain
    await supabase
      .from('stocks')
      .update({ 
        last_updated: new Date().toISOString() 
      })
      .eq('slug', slug);

    return stock;

  } catch (err) {
    console.error('Error fetching fresh stock data:', err);
    return stock; // Purana data hi return kar do
  }
}
