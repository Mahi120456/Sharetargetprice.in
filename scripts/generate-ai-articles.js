// scripts/generate-ai-articles.js
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REQUEST_DELAY_MS = 2000;
const CHECKPOINT_FILE = 'articles_generation_checkpoint.json';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
      console.log(`📌 Resuming from checkpoint: ${data.lastSlug || 'none'}`);
      return data.lastSlug || null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

function saveCheckpoint(slug) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastSlug: slug }, null, 2));
  console.log(`💾 Checkpoint saved: ${slug}`);
}

function buildPrompt(stock) {
  const {
    name,
    symbol,
    sector,
    current_price,
    pe_ratio,
    eps,
    high52,
    low52,
    market_cap,
    roe,
    roce
  } = stock;

  const currentPrice = current_price || 100;
  const pe = pe_ratio || 'N/A';
  const epsValue = eps || 'N/A';
  const high = high52 || 'N/A';
  const low = low52 || 'N/A';
  const mcap = market_cap ? (market_cap / 10000000).toFixed(2) : 'N/A';
  const roeValue = roe ? `${roe}%` : 'N/A';
  const roceValue = roce ? `${roce}%` : 'N/A';
  const currentYear = new Date().getFullYear();

  // The prompt uses the HDFC vs ICICI example as a quality reference
  return `
Write a detailed, investor‑friendly article about ${name} (${symbol}) listed on NSE/BSE.
The article should be written in **Hinglish** (mix of Hindi and English), professional yet easy to understand, similar to a financial blog post.

Use the following real data (do not invent any numbers):

- Current share price: ₹${currentPrice}
- P/E Ratio: ${pe}
- EPS (TTM): ₹${epsValue}
- 52‑week high/low: ₹${high} / ₹${low}
- Market capitalisation: ₹${mcap} crore
- ROE: ${roeValue}
- ROCE: ${roceValue}
- Sector: ${sector || 'General'}

## Article structure (must follow exactly)

1. **Start with an engaging introduction** – 2‑3 paragraphs about the company and its recent performance, referencing the current price and why investors are interested.

2. **Key Financials table** – present the above metrics in a clean HTML table with borders.

3. **Section: Why investors are watching ${name}** – write 2‑3 short paragraphs on sector growth, government policies, or company‑specific triggers.

4. **Share price targets** – create a table for years: ${currentYear+1}, 2028, 2030, 2035, 2040, 2050. Use realistic CAGR (10‑15% per year) based on current price ₹${currentPrice}.

5. **For each target year** (as separate H3 subsections), add:
   - A very short introductory sentence.
   - A bullet list with "Bull case", "Bear case", "Neutral case" (each 1‑2 lines).

6. **Section: Risks to consider** – bullet list with 4‑5 genuine risks.

7. **Conclusion** – 2‑3 paragraphs summarising the long‑term outlook, without "buy/sell" advice.

8. **FAQ** – at least 4 questions with short answers.

## Formatting rules (strict)

- Use <h1> for the main title, <h2> for main sections, <h3> for target years.
- **Every paragraph must be wrapped in <p> tags**.
- Tables must have border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;".
- Use <ul> and <li> for lists.
- **Do NOT include any extra <html>, <head>, or <body> tags** – only the article content starting with <h1>.
- Do NOT write any meta‑commentary ("Here is your article", "Certainly", etc.).
- Write short, varied sentences; keep paragraphs to 2‑3 lines.

## Example of the desired quality (copy this style exactly)

Here is a short example of the tone and formatting we want:

<h1>HDFC Bank vs ICICI Bank Analysis: 2026 में कौन सा Stock बनेगा Multibagger?</h1>

<p><strong>Budget 2026</strong> के बाद भारतीय बैंकिंग सेक्टर एक अहम मोड़ पर खड़ा है... (full example as provided).</p>

<p>इसके अलावा, मार्केट को उम्मीद है कि फरवरी 2026 की मॉनेटरी पॉलिसी में RBI और रेट कट दे सकता है...</p>

... (etc.)

Now write the article for ${name} using the data above. Follow the structure and formatting rules strictly.
`;
}

async function generateHeavyContent() {
  console.log('🔄 Fetching stocks with missing content...');
  const { data: stocks, error } = await supabase
    .from('stocks')
    .select('slug, name, symbol, sector, current_price, pe_ratio, eps, high52, low52, market_cap, roe, roce')
    .is('content', null)
    .order('name', { ascending: true });

  if (error) {
    console.error('❌ Failed to fetch stocks:', error.message);
    process.exit(1);
  }
  if (!stocks || stocks.length === 0) {
    console.log('✅ No stocks need content generation. Exiting.');
    return;
  }

  console.log(`📊 Found ${stocks.length} stocks to process.`);
  const lastSlug = loadCheckpoint();
  let startIndex = 0;
  if (lastSlug) {
    const idx = stocks.findIndex(s => s.slug === lastSlug);
    if (idx !== -1) startIndex = idx + 1;
    else console.warn('⚠️ Checkpoint not found, starting fresh');
  }

  let success = 0, fail = 0;
  for (let i = startIndex; i < stocks.length; i++) {
    const stock = stocks[i];
    console.log(`\n📝 [${i+1}/${stocks.length}] Generating article for ${stock.name} (${stock.symbol})`);
    try {
      const prompt = buildPrompt(stock);
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 3000,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      const content = response.data.choices[0].message.content;
      if (!content || content.length < 800) throw new Error('Content too short');
      await supabase.from('stocks').update({ content, last_updated: new Date().toISOString() }).eq('slug', stock.slug);
      console.log(`✅ Saved article for ${stock.name}`);
      success++;
      saveCheckpoint(stock.slug);
    } catch (err) {
      console.error(`❌ Failed for ${stock.name}:`, err.message);
      fail++;
    }
    await delay(REQUEST_DELAY_MS);
  }
  console.log(`\n========== GENERATION COMPLETE ==========`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${fail}`);
  console.log(`==========================================`);
}

generateHeavyContent().catch(console.error);
