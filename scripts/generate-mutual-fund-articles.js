// scripts/generate-mutual-fund-articles.js
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REQUEST_DELAY_MS = 2000;
const CHECKPOINT_FILE = 'mutual_fund_articles_checkpoint.json';

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

// Build prompt for mutual funds
function buildPrompt(fund) {
  const {
    scheme_name,
    fund_house,
    category,
    riskometer,
    returns_1y,
    returns_3y,
    returns_5y,
    aum,
    expense_ratio,
    min_sip_amount,
    benchmark,
    launch_date
  } = fund;

  const aumText = aum ? `₹${(aum / 1000).toFixed(2)}k Crore` : 'N/A';
  const expenseText = expense_ratio ? `${expense_ratio}%` : 'N/A';
  const launchYear = launch_date ? new Date(launch_date).getFullYear() : 'N/A';
  const returns1yText = returns_1y ? `${returns_1y.toFixed(2)}%` : 'N/A';
  const returns3yText = returns_3y ? `${returns_3y.toFixed(2)}%` : 'N/A';
  const returns5yText = returns_5y ? `${returns_5y.toFixed(2)}%` : 'N/A';

  return `
You are a mutual fund expert and financial writer. Write a detailed, SEO-optimized article (800-1000 words) for the mutual fund: "${scheme_name}".

**Fund Details:**
- Fund House: ${fund_house || 'N/A'}
- Category: ${category || 'N/A'}
- Riskometer: ${riskometer || 'Moderate'}
- AUM: ${aumText}
- Expense Ratio: ${expenseText}
- Min SIP: ₹${min_sip_amount || 500}
- Benchmark: ${benchmark || 'N/A'}
- Launch Year: ${launchYear}
- 1Y Return: ${returns1yText}
- 3Y Return: ${returns3yText}
- 5Y Return: ${returns5yText}

**Output Format (strictly HTML only):**
- Start with <h1>Fund Name</h1>
- Use <h2> for main sections, <h3> for subsections.
- Every paragraph inside <p> tags.
- Include the following sections in order:

<h2>Fund Overview</h2>
<p>... brief introduction, fund house, category, risk level, AUM, expense ratio, launch date.</p>

<h2>Investment Objective & Strategy</h2>
<p>... describe the fund's goal, investment approach (active/passive), benchmark, and asset allocation.</p>

<h2>Returns & Performance Analysis</h2>
<p>... discuss 1Y, 3Y, 5Y returns, comparison with benchmark and category average. Include a small table (optional).</p>

<h2>Pros & Cons</h2>
<ul>
  <li><strong>✅ Pros:</strong> ... (list 3-5 points)</li>
  <li><strong>❌ Cons:</strong> ... (list 2-4 points)</li>
</ul>

<h2>Risk Profile & Suitability</h2>
<p>... explain the riskometer level (Low/Moderate/High/Very High), volatility, and which type of investors (e.g., aggressive, conservative) this fund suits.</p>

<h2>Who Should Invest?</h2>
<p>... ideal investment horizon (short, medium, long), tax implications (briefly), and allocation advice.</p>

<h2>Fund Manager & Fund House Credibility</h2>
<p>... mention fund manager (if known), fund house reputation, track record, and assets managed.</p>

<h2>FAQs (4-6 questions)</h2>
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is the minimum SIP amount for ${scheme_name}?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>₹${min_sip_amount || 500}.</p></div>
    </div>
  </div>
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Is ${scheme_name} suitable for long-term wealth creation?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text"><p>... answer based on category and risk.</p></div>
    </div>
  </div>
  <!-- Add 2-4 more relevant FAQs -->
</div>

<h2>Conclusion</h2>
<p>... final verdict, who should consider this fund, and a disclaimer.</p>

Write in simple, investor-friendly Hinglish (mix of Hindi and English) with short paragraphs for good readability. Keep the tone informative and unbiased. Do not give direct buy/sell advice. Use a disclaimer at the end: "Mutual fund investments are subject to market risks. Please consult your financial advisor."

Now generate the article for "${scheme_name}". Output only valid HTML, starting with <h1>.
`;
}

async function generateMutualFundArticles() {
  console.log('🔄 Fetching mutual funds with missing content...');
  const { data: funds, error } = await supabase
    .from('mutual_funds')
    .select('scheme_name, slug, fund_house, category, riskometer, returns_1y, returns_3y, returns_5y, aum, expense_ratio, min_sip_amount, benchmark, launch_date')
    .is('content', null)
    .order('scheme_name', { ascending: true });

  if (error) {
    console.error('❌ Failed to fetch mutual funds:', error.message);
    process.exit(1);
  }
  if (!funds || funds.length === 0) {
    console.log('✅ No mutual funds need content generation. Exiting.');
    return;
  }

  console.log(`📊 Found ${funds.length} mutual funds to process.`);
  const lastSlug = loadCheckpoint();
  let startIndex = 0;
  if (lastSlug) {
    const idx = funds.findIndex(f => f.slug === lastSlug);
    if (idx !== -1) startIndex = idx + 1;
    else console.warn('⚠️ Checkpoint not found, starting fresh');
  }

  let success = 0, fail = 0;
  for (let i = startIndex; i < funds.length; i++) {
    const fund = funds[i];
    console.log(`\n📝 [${i+1}/${funds.length}] Generating article for ${fund.scheme_name}`);
    try {
      const prompt = buildPrompt(fund);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 2800,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      let content = response.data.choices[0].message.content;
      if (!content || content.length < 500) throw new Error('Content too short');
      content = content.replace(/^```html\s*/, '').replace(/\s*```$/, '');
      await supabase.from('mutual_funds').update({ content, updated_at: new Date().toISOString() }).eq('slug', fund.slug);
      console.log(`✅ Saved article for ${fund.scheme_name}`);
      success++;
      saveCheckpoint(fund.slug);
    } catch (err) {
      console.error(`❌ Failed for ${fund.scheme_name}:`, err.message);
      fail++;
    }
    await delay(REQUEST_DELAY_MS);
  }
  console.log(`\n========== GENERATION COMPLETE ==========`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${fail}`);
  console.log(`=========================================`);
}

generateMutualFundArticles().catch(console.error);
