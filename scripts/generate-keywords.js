const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SERVICE_ROLE_KEY');

async function automateKeywords() {
  const { data: stocks } = await supabase.from('stocks').select('slug, name, symbol');

  for (const stock of stocks) {
    const name = stock.name;
    const sym = stock.symbol;

    const modifiers = [
      `${name} share price target 2025`,
      `${name} share price target 2030`,
      `${name} price prediction 2026`,
      `${name} target price 2027`,
      `${name} share price target 2040`,
      `${name} share price target 2050`,
      `is ${name} good for long term`,
      `${name} share target price in hindi`,
      `why ${name} share is falling today`,
      `why ${name} share is rising today`,
      `${name} dividend record date 2026`,
      `${name} bonus share news`,
      `${name} multibagger target`,
      `expert view on ${name} share`,
      `intrinsic value of ${name} stock`,
      `nse ${sym} target price`,
      `${name} share price target for tomorrow`,
      `buy or sell ${name} share today`,
      `${name} q3 results update`,
      `top share price target ${name}`
    ];

    const keywordObjects = modifiers.map(kw => ({
      stock_slug: stock.slug,
      keyword: kw,
      search_intent: 'seo_optimized'
    }));

    const { error } = await supabase.from('stock_keywords').insert(keywordObjects);
    if (error) console.log(`Error for ${name}:`, error);
    else console.log(`✅ 20 Keywords added for ${name}`);
  }
}

automateKeywords();
