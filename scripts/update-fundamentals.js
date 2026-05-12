const { createClient } = require('@supabase/supabase-js');
const YahooFinance = require('yahoo-finance2').default; // ✅ .default add karna hai
const yahooFinance = new YahooFinance(); // ✅ v3 syntax

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ... baaki code same rahega (updateAllStocks function unchanged)
