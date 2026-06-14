import { createClient } from '@supabase/supabase-js';
import yahooFinance from 'yahoo-finance2';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateFundamentals() {
  const { data: stocks, error } = await supabase
    .from('stocks')
    .select('id,symbol')
    .limit(20);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Found ${stocks.length} stocks`);

  let success = 0;
  let failed = 0;

  for (const stock of stocks) {
    try {
      const ticker = `${stock.symbol}.NS`;

      const quote = await yahooFinance.quote(ticker);

      const summary = await yahooFinance.quoteSummary(ticker, {
        modules: [
          'financialData',
          'defaultKeyStatistics',
          'assetProfile'
        ]
      });

      const financialData = summary.financialData || {};
      const stats = summary.defaultKeyStatistics || {};
      const profile = summary.assetProfile || {};

      const updateData = {
        current_price: quote.regularMarketPrice ?? null,
        open_price: quote.regularMarketOpen ?? null,
        day_high: quote.regularMarketDayHigh ?? null,
        day_low: quote.regularMarketDayLow ?? null,
        volume: quote.regularMarketVolume ?? null,
        high52: quote.fiftyTwoWeekHigh ?? null,
        low52: quote.fiftyTwoWeekLow ?? null,
        market_cap: quote.marketCap ?? null,
        pe_ratio: quote.trailingPE ?? null,
        eps: quote.epsTrailingTwelveMonths ?? null,
        dividend_yield: quote.dividendYield ?? null,

        sector: profile.sector ?? null,
        industry: profile.industry ?? null,

        pb_ratio: stats.priceToBook ?? null,
        book_value: stats.bookValue ?? null,

        roe: financialData.returnOnEquity
          ? financialData.returnOnEquity * 100
          : null,

        debt_to_equity:
          financialData.debtToEquity ?? null,

        last_updated: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('stocks')
        .update(updateData)
        .eq('id', stock.id);

      if (updateError) {
        console.error(
          `DB Error ${stock.symbol}:`,
          updateError.message
        );
        failed++;
      } else {
        console.log(`✅ ${stock.symbol}`);
        success++;
      }
    } catch (err) {
      console.error(
        `❌ ${stock.symbol}:`,
        err.message
      );
      failed++;
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('--------------------');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

updateFundamentals();
