import { supabase } from './supabase';

// Kitne ghante purana data fresh maana jaaye
const CACHE_HOURS = 24;

export async function getStockWithCache(slug: string) {
  // 1. Database se data lo
  const { data: stock, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !stock) return null;

  // 2. Check freshness
  const lastUpdated = new Date(stock.last_updated);
  const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

  // Agar data fresh hai (< 24 hours) to cache se hi return karo
  if (hoursSinceUpdate < CACHE_HOURS) {
    return stock;
  }

  // 3. Data purana hai → fresh fetch karo (Yahoo + FMP)
  try {
    // TODO: Yahan Yahoo + FMP se data fetch karna hai
    // Abhi ke liye sirf last_updated update kar rahe hain
    await supabase
      .from('stocks')
      .update({ last_updated: new Date().toISOString() })
      .eq('slug', slug);

    return stock; // Baad mein yahan fresh data merge karenge
  } catch (err) {
    console.error('Fetch error:', err);
    return stock; // Purana data hi de do
  }
}
