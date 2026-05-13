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

  // Build prompt as normal string without backticks inside
  return `
You are an ELITE Indian stock market analyst. Write a premium quality, human-like, SEO-optimized stock analysis article in valid HTML.

Use the exact data provided. Output only pure HTML, no markdown, no extra text.

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
STRICT HTML FORMATTING RULES
==================================================

1. EVERY paragraph MUST be in <p> tags.
2. After every <h2> or <h3>, the next element MUST be <p> (no raw text).
3. Tables: use <table border="1" style="border-collapse: collapse; width: 100%;"> with <thead> and <tbody>.
4. Headings: <h1>, <h2> (main sections), <h3> (subsections).
5. Use <ul> and <li> for lists.
6. Start with <!DOCTYPE html> and end with </body></html>.
7. Do NOT include any markdown or explanations outside HTML.

==================================================
META TAGS (include inside <head>)
==================================================

<title>${name} Share Price Target ${currentYear+1}, 2030, 2040 & 2050</title>
<meta name="description" content="Get detailed ${name} share price target for ${currentYear+1}, 2030, 2040 & 2050. Expert analysis, financial health, and long-term outlook.">
<meta name="keywords" content="${name} share price target, ${symbol} target, stock analysis">
<link rel="canonical" href="https://sharetargetprice.in/stock/${name.toLowerCase().replace(/ /g, '-')}-share-price-target">
<meta name="viewport" content="width=device-width, initial-scale=1">

==================================================
ARTICLE STRUCTURE (MANDATORY)
==================================================

<article>

<h1>${name} Share Price Target ${currentYear+1}, 2030, 2040 & 2050</h1>

<h2>1. Executive Summary</h2>
<p>Write a strong investor-focused introduction covering company overview and long-term outlook. 2-3 paragraphs.</p>

<h2>2. About ${name}</h2>
<p>Company history, business model, revenue sources, market position, competitive advantage. 3-4 paragraphs.</p>

<h2>3. Why Investors Are Watching ${name}</h2>
<p>Growth drivers, sector trends, expansion opportunities. 2-3 paragraphs.</p>

<h2>4. Financial Health Analysis</h2>
<p>Brief intro sentence.</p>
<table border="1" style="border-collapse: collapse; width: 100%;">
  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
  <tbody>
    <tr><td>Current Price</td><td>₹${currentPrice}</td></tr>
    <tr><td>Market Cap</td><td>₹${mcap} Cr</td></tr>
    <tr><td>P/E Ratio</td><td>${pe}</td></tr>
    <tr><td>EPS</td><td>₹${epsValue}</td></tr>
    <tr><td>ROE</td><td>${roeValue}</td></tr>
    <tr><td>ROCE</td><td>${roceValue}</td></tr>
    <tr><td>52W High</td><td>₹${high}</td></tr>
    <tr><td>52W Low</td><td>₹${low}</td></tr>
  </tbody>
</table>
<p>Discussion of valuation, efficiency, profitability. 2 paragraphs.</p>

<h2>5. Profitability & Valuation Analysis</h2>
<p>Explain P/E, EPS quality, ROE, ROCE, valuation comfort. 2-3 paragraphs.</p>

<h2>6. Technical Analysis Overview</h2>
<p>Price trend, momentum, support/resistance, 52-week range interpretation. 2 paragraphs.</p>

<h2>7. SWOT Analysis</h2>
<ul>
  <li><strong>Strengths:</strong> ...</li>
  <li><strong>Weaknesses:</strong> ...</li>
  <li><strong>Opportunities:</strong> ...</li>
  <li><strong>Threats:</strong> ...</li>
</ul>

<h2>8. ${name} Share Price Target (${currentYear+1} to 2050)</h2>
<p>Based on realistic CAGR of 10-15% per year from current price ₹${currentPrice}.</p>
<table border="1" style="border-collapse: collapse; width: 100%;">
  <thead><tr><th>Year</th><th>Minimum Target</th><th>Maximum Target</th><th>Expected Sentiment</th></tr></thead>
  <tbody>
    <tr><td>${currentYear+1}</td><td>₹${Math.round(currentPrice*1.10)}</td><td>₹${Math.round(currentPrice*1.15)}</td><td>Positive</td></tr>
    <tr><td>${currentYear+2}</td><td>₹${Math.round(currentPrice*1.21)}</td><td>₹${Math.round(currentPrice*1.32)}</td><td>Positive</td></tr>
    <tr><td>2030</td><td>₹${Math.round(currentPrice*1.61)}</td><td>₹${Math.round(currentPrice*2.01)}</td><td>Optimistic</td></tr>
    <tr><td>2035</td><td>₹${Math.round(currentPrice*2.59)}</td><td>₹${Math.round(currentPrice*4.05)}</td><td>Very Positive</td></tr>
    <tr><td>2040</td><td>₹${Math.round(currentPrice*4.18)}</td><td>₹${Math.round(currentPrice*8.14)}</td><td>Optimistic</td></tr>
    <tr><td>2045</td><td>₹${Math.round(currentPrice*6.73)}</td><td>₹${Math.round(currentPrice*16.37)}</td><td>Very Positive</td></tr>
    <tr><td>2050</td><td>₹${Math.round(currentPrice*10.83)}</td><td>₹${Math.round(currentPrice*32.92)}</td><td>Extremely Positive</td></tr>
  </tbody>
</table>

<h3>${name} Share Price Target ${currentYear+1}</h3>
<p>Detailed analysis. 2-3 paragraphs.</p>
<ul><li><strong>Bull Case:</strong> ...</li><li><strong>Bear Case:</strong> ...</li><li><strong>Neutral Case:</strong> ...</li></ul>

<h3>${name} Share Price Target ${currentYear+2}</h3>
<p>Detailed analysis...</p>
<ul>...</ul>

... (repeat similarly for 2030, 2035, 2040, 2045, 2050) ...

<h2>9. Shareholding Pattern & Investor Sentiment</h2>
<p>Discuss institutional confidence, retail participation. 2 paragraphs.</p>

<h2>10. Future Growth Catalysts</h2>
<p>Expansion, innovation, industry growth, policy support. 2 paragraphs.</p>

<h2>11. Risk Factors</h2>
<ul><li>Competition</li><li>Market volatility</li><li>Economic slowdown</li><li>Regulatory risks</li></ul>

<h2>12. Is ${name} a Good Long-Term Investment?</h2>
<p>Balanced viewpoint, long-term suitability, risk-reward discussion. 2-3 paragraphs.</p>

<h2>13. Conclusion</h2>
<p>Strong human-written summary, balanced perspective. 2 paragraphs.</p>

<h2>14. Frequently Asked Questions (FAQs)</h2>
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is ${name} share price target for ${currentYear+1}?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Expected target range ₹${Math.round(currentPrice*1.10)} to ₹${Math.round(currentPrice*1.15)}.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is ${name} share price target for 2030?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Estimated ₹${Math.round(currentPrice*1.61)} to ₹${Math.round(currentPrice*2.01)}.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Is ${name} a good long-term investment?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Given its sector leadership and government focus, it has long-term potential but investors should monitor valuations.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is the 52-week range of ${name}?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>₹${low} to ₹${high}.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What are the risks of investing in ${name}?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Competition, economic slowdown, and high valuation multiples.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Can ${name} reach ₹${Math.round(currentPrice*2)} in 5 years?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Possible if the industry grows at double-digit rates, but not guaranteed.</p></div>
    </div>
  </div>
</div>

</article>

==================================================
FINAL OUTPUT RULE
==================================================

Return ONLY COMPLETE HTML DOCUMENT starting with <!DOCTYPE html> and ending with </body></html>. NO extra text.
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
