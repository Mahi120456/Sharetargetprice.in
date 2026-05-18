import { supabase } from './supabase';

interface YahooQuote {
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
  regularMarketPrice?: number;
  regularMarketDayLow?: number;
  regularMarketDayHigh?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  regularMarketVolume?: number;
}

export async function updateStockPerformance(slug: string, symbol: string) {
  try {
    // Yahoo Finance se data fetch karo
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    );

    if (!response.ok) return false;

    const json = await response.json();
    const result = json.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta) return false;

    const updateData: any = {
      open_price: meta.regularMarketOpen,
      prev_close: meta.regularMarketPreviousClose,
      current_price: meta.regularMarketPrice,
      high52: meta.fiftyTwoWeekHigh,
      low52: meta.fiftyTwoWeekLow,
      volume: meta.regularMarketVolume,
      last_updated: new Date().toISOString(),
    };

    // Database update karo
    const { error } = await supabase
      .from('stocks')
      .update(updateData)
      .eq('slug', slug);

    if (error) {
      console.error('Error updating stock performance:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Yahoo fetch error:', err);
    return false;
  }
}
