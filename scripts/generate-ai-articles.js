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

// ============================================================
// FINAL MASTER PROMPT – 2000-3000 words, clean HTML, proper spacing
// ============================================================
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
You are a professional financial analyst and a senior content writer for an Indian stock market website. Your task is to write a **high-quality, detailed, SEO-optimized stock analysis article** of **2000 to 3000 words** for the company ${name} (${symbol}) listed on NSE/BSE.

**IMPORTANT – OUTPUT FORMAT RULES (STRICT):**
1. Output ONLY pure HTML. Start directly with <h1>. DO NOT include <!DOCTYPE>, <html>, <head>, <body>, or any meta tags.
2. No markdown, no code fences, no explanations outside HTML.
3. Every paragraph MUST be wrapped in <p> tags. After every heading (<h1>, <h2>, <h3>), the next element must be a <p> (never raw text).
4. Use proper heading hierarchy: <h1> for main title, <h2> for sections, <h3> for subsections (e.g., each target year).
5. Use <ul> and <li> for bullet points. Tables must have border="1", cellpadding="5", style="border-collapse: collapse; width: 100%;".
6. Write in Hinglish (Hindi + English) – natural, conversational, yet professional. Short paragraphs (2-4 sentences) for readability and automatic spacing.
7. **Length:** The final article must be between 2000 and 3000 words. Expand each section with meaningful, original analysis. Do not be brief.

**REAL DATA TO USE (exactly as given, do not invent numbers):**
- Company name: ${name}
- Symbol: ${symbol}
- Current Price: ₹${currentPrice}
- Sector: ${sector || 'General'}
- P/E Ratio: ${pe}
- EPS (TTM): ₹${epsValue}
- 52‑week High / Low: ₹${high} / ₹${low}
- Market Capitalization: ₹${mcap} crore
- ROE: ${roeValue}
- ROCE: ${roceValue}

**MANDATORY ARTICLE STRUCTURE (follow exactly, but expand each section with sufficient detail to reach 2000-3000 words):**

<h1>${name} Share Price Target ${currentYear+1}, 2030, 2040 & 2050</h1>

<h2>1. Executive Summary</h2>
<p>Write 3-4 substantial paragraphs. Cover: company overview, current market standing, recent performance, why this stock is in news, and a balanced long-term outlook.</p>

<h2>2. About ${name}</h2>
<p>4-5 paragraphs: history, founding year, business segments, revenue streams, key subsidiaries, competitive advantages, market share.</p>

<h2>3. Why Investors Are Watching ${name}</h2>
<p>3-4 paragraphs: growth drivers, sector trends (like government initiatives, digital transformation, infrastructure spending), expansion plans, and any recent positive developments.</p>

<h2>4. Financial Health Analysis</h2>
<p>1 introductory paragraph, then the table, then 2-3 paragraphs discussing the meaning of each metric (valuation, efficiency, profitability, debt position, etc.).</p>
<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
  <tbody>
    <tr><td>Current Price</td><td>₹${currentPrice}</td></tr>
    <tr><td>Market Cap</td><td>₹${mcap} Cr</td></tr>
    <tr><td>P/E Ratio</td><td>${pe}</td></tr>
    <tr><td>EPS (TTM)</td><td>₹${epsValue}</td></tr>
    <tr><td>ROE</td><td>${roeValue}</td></tr>
    <tr><td>ROCE</td><td>${roceValue}</td></tr>
    <tr><td>52‑week High</td><td>₹${high}</td></tr>
    <tr><td>52‑week Low</td><td>₹${low}</td></tr>
  </tbody>
</table>
<p>Detailed analysis of each metric – what it means for investors, how it compares to industry peers, and whether the current valuation is justified.</p>

<h2>5. Profitability & Valuation Analysis</h2>
<p>3-4 paragraphs: deeper dive into P/E, EPS quality, ROE and ROCE trends, historical valuation ranges, and sector comparison.</p>

<h2>6. Technical Analysis Overview</h2>
<p>2-3 paragraphs: recent price action, support and resistance levels (derive from 52‑week range), moving averages, volume trends, and chart patterns if any.</p>

<h2>7. SWOT Analysis</h2>
<ul>
  <li><strong>Strengths:</strong> at least 4-5 points</li>
  <li><strong>Weaknesses:</strong> at least 3-4 points</li>
  <li><strong>Opportunities:</strong> at least 4-5 points</li>
  <li><strong>Threats:</strong> at least 3-4 points</li>
</ul>

<h2>8. Share Price Targets (${currentYear+1} to 2050)</h2>
<p>Based on realistic CAGR of 10‑15% from current price ₹${currentPrice}. The following table summarises the expected price range for each milestone year.</p>
<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
  <thead><tr><th>Year</th><th>Minimum Target (₹)</th><th>Maximum Target (₹)</th><th>Expected Sentiment</th></tr></thead>
  <tbody>
    <tr><td>${currentYear+1}</td><td>${Math.round(currentPrice*1.10)}</td><td>${Math.round(currentPrice*1.15)}</td><td>Positive</td></tr>
    <tr><td>${currentYear+2}</td><td>${Math.round(currentPrice*1.21)}</td><td>${Math.round(currentPrice*1.32)}</td><td>Positive</td></tr>
    <tr><td>2030</td><td>${Math.round(currentPrice*1.61)}</td><td>${Math.round(currentPrice*2.01)}</td><td>Optimistic</td></tr>
    <tr><td>2035</td><td>${Math.round(currentPrice*2.59)}</td><td>${Math.round(currentPrice*4.05)}</td><td>Very Positive</td></tr>
    <tr><td>2040</td><td>${Math.round(currentPrice*4.18)}</td><td>${Math.round(currentPrice*8.14)}</td><td>Optimistic</td></tr>
    <tr><td>2045</td><td>${Math.round(currentPrice*6.73)}</td><td>${Math.round(currentPrice*16.37)}</td><td>Very Positive</td></tr>
    <tr><td>2050</td><td>${Math.round(currentPrice*10.83)}</td><td>${Math.round(currentPrice*32.92)}</td><td>Extremely Positive</td></tr>
  </tbody>
</table>

<h3>${name} Share Price Target ${currentYear+1}</h3>
<p>Write 3-4 paragraphs explaining the rationale for the ${currentYear+1} target. Discuss expected earnings growth, sector tailwinds, and potential risks.</p>
<ul><li><strong>Bull Case:</strong> (1-2 lines)</li><li><strong>Bear Case:</strong> (1-2 lines)</li><li><strong>Neutral Case:</strong> (1-2 lines)</li></ul>

<h3>${name} Share Price Target ${currentYear+2}</h3>
<p>Similar detailed analysis for ${currentYear+2} – 3-4 paragraphs plus bull/bear/neutral bullets.</p>

<h3>${name} Share Price Target 2030</h3>
<p>3-4 paragraphs. Focus on long-term structural growth, expected changes in the sector, and the company’s positioning by 2030.</p>
<ul>… (same structure)</ul>

<h3>${name} Share Price Target 2035</h3>
<p>3-4 paragraphs. Discuss how technological shifts and economic cycles might affect the stock.</p>

<h3>${name} Share Price Target 2040</h3>
<p>3-4 paragraphs. Talk about the company’s potential to scale and adapt over two decades.</p>

<h3>${name} Share Price Target 2045</h3>
<p>3-4 paragraphs. Consider demographic changes, climate policies, and global trends.</p>

<h3>${name} Share Price Target 2050</h3>
<p>3-4 paragraphs. Very long-term vision – what would make the stock achieve the highest targets.</p>

<h2>9. Shareholding Pattern & Investor Sentiment</h2>
<p>3 paragraphs: promoter holding, FII/DII trends, retail participation, and what recent quarterly data suggests about institutional confidence.</p>

<h2>10. Future Growth Catalysts</h2>
<p>3-4 paragraphs: upcoming projects, new product lines, policy announcements (e.g., budget, PLI schemes), digital transformation, and any likely triggers.</p>

<h2>11. Risk Factors</h2>
<ul>
  <li>Intensifying competition from domestic and global players</li>
  <li>Regulatory changes in the ${sector || 'financial'} sector</li>
  <li>Economic slowdown affecting demand</li>
  <li>High valuation multiples leading to volatility</li>
  <li>Execution risks in expansion plans</li>
</ul>

<h2>12. Is ${name} a Good Long‑Term Investment?</h2>
<p>4-5 paragraphs. Present a balanced view – who should consider this stock, what time horizon suits, and how it fits into a diversified portfolio. Do NOT give direct “buy” or “sell” recommendations. Use phrases like “may be suitable for”, “investors with high risk appetite could consider”, etc.</p>

<h2>13. Conclusion</h2>
<p>3-4 paragraphs summarising the entire analysis. Restate key takeaways: financial health, growth potential, risks, and the long‑term outlook. End with a forward-looking statement.</p>

<h2>14. Frequently Asked Questions (FAQs)</h2>
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is the realistic ${name} share price target for ${currentYear+1}?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Based on current fundamentals, the stock could trade between ₹${Math.round(currentPrice*1.10)} and ₹${Math.round(currentPrice*1.15)}.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Is ${name} a good long-term investment?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Given its strong ROE and sector tailwinds, it has long-term potential, but investors should watch valuation and market conditions.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is the 52‑week range of ${name}?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>₹${low} – ₹${high}.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What are the major risks of investing in ${name}?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Competition, economic cycles, regulatory changes, and high valuation multiples.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Can ${name} become a multibagger by 2030?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>Possible if earnings grow at 20%+ annually, but such returns come with higher risk.</p></div>
    </div>
  </div>
</div>

Now generate the complete article for ${name}. Ensure the total length is **2000 to 3000 words**. Write in a natural, human-like, Hinglish style. Start directly with <h1> and output only valid HTML.
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
          temperature: 0.6,
          max_tokens: 4000,   // Increased to allow 2000-3000 words output
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      let content = response.data.choices[0].message.content;

      // Basic validation: ensure content is not too short
      if (!content || content.length < 1500) throw new Error('Content too short');
      // Optional: remove any stray markdown code fences if present
      content = content.replace(/^```html\s*/, '').replace(/\s*```$/, '');
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
