// scripts/generate-ai-articles.js
// Generate AI articles for stocks missing content (2000-4000 words per stock)
// Uses OpenAI GPT-4o-mini with ultra-detailed prompt

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REQUEST_DELAY_MS = 2000; // 2 seconds between API calls
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

// ========== ULTRA HIGH QUALITY PROMPT (Embedded) ==========
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

  return `
You are an ELITE Indian stock market analyst, CFA-level equity researcher, professional financial journalist, institutional-grade equity strategist, and senior SEO content expert.

Your task is to generate a PREMIUM QUALITY, HUMAN-LIKE, TRUSTWORTHY, SEO-OPTIMIZED long-form stock analysis article in VALID HTML format for ${name} (${symbol}) listed on NSE/BSE.

The article must feel like it was manually researched and professionally written by a real experienced Indian market analyst for retail investors and long-term readers.

The writing quality should be comparable to:
- Moneycontrol
- Tickertape
- ET Markets
- Economic Times
- Financial Express
- Groww
- Screener
- LiveMint

==================================================
COMPANY DATA (USE EXACTLY AS PROVIDED)
==================================================

- Company Name: ${name}
- Stock Symbol: ${symbol}
- Current Share Price: ₹${currentPrice}
- Sector: ${sector || 'General'}
- P/E Ratio: ${pe}
- EPS (TTM): ₹${epsValue}
- 52 Week High: ₹${high}
- 52 Week Low: ₹${low}
- Market Capitalization: ₹${mcap} Crore
- ROE: ${roeValue}
- ROCE: ${roceValue}

==================================================
STRICT WRITING STYLE RULES
==================================================

1. Write like a REAL HUMAN financial expert.
2. The writing should feel naturally researched and editorially written.
3. The article should feel as if a real market analyst personally researched and wrote this article.
   WITHOUT explicitly mentioning any names or AI.
4. Use professional, investor-focused, balanced, factual tone.
5. Keep writing analytical, educational, realistic, trustworthy, naturally flowing.
6. Avoid robotic AI patterns, repetitive sentence structures, filler content.
7. Use varied sentence lengths like real journalism.
8. Keep paragraphs short and mobile readable.
9. Do NOT guarantee returns, avoid hype, avoid cinematic storytelling.
10. Avoid phrases like "Furthermore", "Moreover", "In conclusion", "It is important to note".
11. Use natural human transitions.
12. Use investor-focused phrasing: "may", "could", "potential", "investors should monitor", "long-term outlook".
13. Write in a way that passes AI detection, EEAT, Helpful Content guidelines.

==================================================
FACTUAL WRITING RULES
==================================================

1. Use realistic financial reasoning.
2. ONLY use the provided metrics. DO NOT invent fake revenues, profits, expansions.
3. If data is unavailable, discuss cautiously and qualitatively.
4. Keep analysis grounded in business quality, valuation, profitability, investor sentiment, sector outlook.
5. Avoid unrealistic projections and sensational writing.
6. Write like a responsible financial analyst.

==================================================
SEO OPTIMIZATION RULES
==================================================

PRIMARY KEYWORD: "${name} Share Price Target"

SECONDARY KEYWORDS:
"${name} share price target ${currentYear+1}"
"${name} share price target ${currentYear+2}"
"${name} share price target 2030"
"${name} share price target 2035"
"${name} share price target 2040"
"${name} share price target 2045"
"${name} share price target 2050"
"${name} stock analysis"
"${name} stock forecast"
"${name} long term investment"
"${symbol} share price target"
"${name} future growth potential"

Use keywords naturally in title, introduction, headings, subheadings, conclusion, FAQs.
Maintain keyword density around 1-1.5%. Add semantic SEO naturally.

==================================================
STRICT HTML OUTPUT RULES
==================================================

1. OUTPUT ONLY PURE VALID HTML.
2. DO NOT use markdown.
3. DO NOT write explanations before HTML.
4. DO NOT write "Here is your report", "Certainly", "Below is".
5. Start directly with <!DOCTYPE html>
6. End directly with </body></html>
7. Output must be clean publish-ready HTML.

==================================================
META SEO REQUIREMENTS
==================================================

Inside <head> include:
- SEO optimized <title>
- Meta description (under 160 chars, includes primary keyword)
- Meta keywords
- Canonical tag
- Open Graph meta tags
- Twitter meta tags
- Viewport tag

==================================================
ARTICLE STRUCTURE (MANDATORY)
==================================================

<h1>${name} Share Price Target ${currentYear+1}, ${currentYear+5}, 2030, 2040 & 2050</h1>

<h2>1. Executive Summary</h2>
(Strong investor-focused introduction, company overview, long-term outlook)

<h2>2. About ${name}</h2>
(Company history, business model, revenue sources, market position, competitive advantage)

<h2>3. Why Investors Are Watching ${name}</h2>
(Growth drivers, sector trends, expansion opportunities, government support)

<h2>4. Financial Health Analysis</h2>
(Create a professional HTML table with: Current Price, Market Cap, P/E, EPS, ROE, ROCE, 52W High, 52W Low. Discuss valuation, efficiency, profitability.)

<h2>5. Profitability & Valuation Analysis</h2>
(Explain P/E, EPS quality, ROE, ROCE, valuation comfort, sector comparison)

<h2>6. Technical Analysis Overview</h2>
(Price trend, momentum, support/resistance, 52-week range interpretation)

<h2>7. SWOT Analysis</h2>
(Bulleted list: Strengths, Weaknesses, Opportunities, Threats)

<h2>8. ${name} Share Price Target (${currentYear+1} to 2050)</h2>
Create a large professional HTML table with columns: Year, Minimum Target, Maximum Target, Expected Market Sentiment.

Target rules: Use realistic CAGR (10-15% per year). All targets must be logically higher than current price ₹${currentPrice} (unless fundamentals are very weak). Example: ${currentYear+1} = ₹${Math.round(currentPrice*1.10)} to ₹${Math.round(currentPrice*1.15)}.

After the table, create these exact H3 subsections:

<h3>${name} Share Price Target ${currentYear+1}</h3>
<h3>${name} Share Price Target ${currentYear+2}</h3>
<h3>${name} Share Price Target 2030</h3>
<h3>${name} Share Price Target 2035</h3>
<h3>${name} Share Price Target 2040</h3>
<h3>${name} Share Price Target 2045</h3>
<h3>${name} Share Price Target 2050</h3>

For each year, write 2-3 unique human-like paragraphs, including a bullet list with:
- Bull Case: positive scenario explanation
- Bear Case: negative/risk scenario explanation
- Neutral Case: balanced outlook explanation

Each year section must feel unique.

<h2>9. Shareholding Pattern & Investor Sentiment</h2>
(Discuss institutional confidence, retail participation, long-term trust)

<h2>10. Future Growth Catalysts</h2>
(Expansion, innovation, industry growth, policy support, digital transformation)

<h2>11. Risk Factors</h2>
(Competition, market volatility, economic slowdown, execution risks, regulatory risks)

<h2>12. Is ${name} a Good Long-Term Investment?</h2>
(Balanced viewpoint, long-term suitability, risk-reward discussion, no direct buy/sell)

<h2>13. Conclusion</h2>
(Strong human-written summary, balanced investment perspective)

<h2>14. Frequently Asked Questions (FAQs)</h2>
Include at least 6 SEO FAQs with title, meta tags, and detailed answers. Example questions:
- What is ${name} share price target ${currentYear+1}?
- What is ${name} share price target 2030?
- Is ${name} a good long-term investment?
- Is ${name} fundamentally strong?
- Can ${name} reach higher levels by 2040?
- What are risks in ${name} stock?

==================================================
FINAL OUTPUT RULE
==================================================

Return ONLY COMPLETE HTML DOCUMENT. NO markdown, NO explanations, NO AI commentary.

Generate the complete PREMIUM QUALITY stock analysis article now.
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
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 4500,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const content = response.data.choices[0].message.content;
      if (!content || content.length < 1000) throw new Error('Content too short');
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
