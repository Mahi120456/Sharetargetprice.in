// scripts/generate-ai-articles.js
// Generate AI articles for stocks missing content (2500+ words per stock)
// Supports OpenAI and Claude (set AI_PROVIDER in .env)

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// ========== CONFIGURATION ==========
const SUPPORTED_AI = ['openai', 'claude'];
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'claude'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Rate limiting: delay between API calls (milliseconds)
const REQUEST_DELAY_MS = 2000;
// Checkpoint file to resume from last processed stock
const CHECKPOINT_FILE = 'articles_generation_checkpoint.json';
// Batch size for updating Supabase
const UPDATE_BATCH_SIZE = 10;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
if (AI_PROVIDER === 'openai' && !OPENAI_API_KEY) {
  console.error('❌ OpenAI API key missing. Set OPENAI_API_KEY in .env');
  process.exit(1);
}
if (AI_PROVIDER === 'claude' && !CLAUDE_API_KEY) {
  console.error('❌ Claude API key missing. Set CLAUDE_API_KEY in .env');
  process.exit(1);
}
if (!SUPPORTED_AI.includes(AI_PROVIDER)) {
  console.error(`❌ Unsupported AI provider: ${AI_PROVIDER}. Use 'openai' or 'claude'`);
  process.exit(1);
}

console.log(`🚀 Using AI provider: ${AI_PROVIDER.toUpperCase()}`);

// ========== SUPABASE CLIENT ==========
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ========== HELPER FUNCTIONS ==========
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
      console.log(`📌 Resuming from checkpoint: last processed slug = ${data.lastSlug || 'none'}`);
      return data.lastSlug || null;
    } catch (e) {
      console.warn('⚠️ Could not load checkpoint file, starting fresh');
      return null;
    }
  }
  return null;
}

function saveCheckpoint(slug) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastSlug: slug }, null, 2));
  console.log(`💾 Checkpoint saved: ${slug}`);
}

// Generate prompt for a specific stock
function buildPrompt(stock) {
  const { name, symbol, sector } = stock;
  const currentYear = new Date().getFullYear();
  return `Write a comprehensive, SEO-optimized financial analysis report for ${name} (${symbol}) on the Indian stock market (NSE/BSE). The report should be detailed, about 2500-3000 words, in HTML format with <h2>, <h3>, <p>, <ul>, <li> tags.

Include these sections EXACTLY:

<h2>1. Executive Summary</h2>
<p>Brief overview of the company and its market position.</p>

<h2>2. Company Overview & Business Segments</h2>
<p>Describe the company's main business, key products, subsidiaries, and revenue streams.</p>

<h2>3. Financial Health & Key Ratios</h2>
<p>Discuss revenue trends, profitability, debt levels, ROE, ROCE, P/E ratio (use realistic estimates).</p>

<h2>4. SWOT Analysis</h2>
<ul><li>Strengths</li><li>Weaknesses</li><li>Opportunities</li><li>Threats</li></ul>

<h2>5. Share Price Targets (2025-2050)</h2>
<p>Provide a table or list of realistic price targets for ${currentYear+1}, 2026, 2027, 2028, 2030, 2035, 2040, 2050 based on logical growth assumptions (CAGR 10-15%).</p>

<h2>6. Technical & Fundamental Outlook</h2>
<p>Analyze recent price action, support/resistance levels, and the long-term investment thesis.</p>

<h2>7. Risk Factors & Future Catalysts</h2>
<p>Highlight macro, regulatory, and company-specific risks, plus upcoming triggers.</p>

<h2>8. Conclusion & Investment Verdict</h2>
<p>Final recommendation for long-term investors (avoid absolute buy/sell, use "potential" language).</p>

Use a professional, educational tone. Avoid claiming future guaranteed returns. Keep the content factual and data-driven.

Now write the report for ${name} (${symbol}) in ${sector || 'general'} sector.`;
}

// Generate article using OpenAI API
async function generateWithOpenAI(prompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini', // cheaper than gpt-4-turbo, good for long form
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

// Generate article using Claude API (Anthropic)
async function generateWithClaude(prompt) {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-5-haiku-20241022', // or 'claude-3-opus-20240229' for higher quality
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    }
  );
  // Claude returns content as array of text blocks
  return response.data.content.map(block => block.text).join('\n');
}

// Update stock content in Supabase
async function updateStockContent(slug, content) {
  const { error } = await supabase
    .from('stocks')
    .update({ content: content, last_updated: new Date().toISOString() })
    .eq('slug', slug);
  if (error) throw error;
}

// ========== MAIN GENERATION LOOP ==========
async function generateHeavyContent() {
  console.log('🔄 Fetching stocks with missing content (content is null)...');

  // Fetch only stocks that have null content
  const { data: stocks, error } = await supabase
    .from('stocks')
    .select('slug, name, symbol, sector')
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

  const lastProcessedSlug = loadCheckpoint();
  let startIndex = 0;
  if (lastProcessedSlug) {
    const idx = stocks.findIndex(s => s.slug === lastProcessedSlug);
    if (idx !== -1) startIndex = idx + 1;
    else console.warn('⚠️ Checkpoint slug not found, starting from beginning');
  }

  let successCount = 0;
  let failCount = 0;
  const failedStocks = [];

  for (let i = startIndex; i < stocks.length; i++) {
    const stock = stocks[i];
    console.log(`\n📝 [${i+1}/${stocks.length}] Generating article for ${stock.name} (${stock.symbol})`);

    try {
      const prompt = buildPrompt(stock);
      let content;
      if (AI_PROVIDER === 'openai') {
        content = await generateWithOpenAI(prompt);
      } else {
        content = await generateWithClaude(prompt);
      }

      // Basic validation: content should be HTML with at least 1500 characters
      if (!content || content.length < 1500) {
        throw new Error('Generated content too short or empty');
      }

      await updateStockContent(stock.slug, content);
      console.log(`✅ Saved article for ${stock.name}`);
      successCount++;
      saveCheckpoint(stock.slug);
    } catch (err) {
      console.error(`❌ Failed for ${stock.name}:`, err.message);
      failCount++;
      failedStocks.push(stock.slug);
      // Continue to next stock, don't stop entire batch
    }

    // Rate limiting delay
    await delay(REQUEST_DELAY_MS);
  }

  // Final summary
  console.log('\n========== GENERATION COMPLETE ==========');
  console.log(`✅ Success: ${successCount} stocks`);
  console.log(`❌ Failed: ${failCount} stocks`);
  if (failedStocks.length > 0) {
    console.log(`Failed slugs: ${failedStocks.join(', ')}`);
    fs.writeFileSync('failed_stocks.json', JSON.stringify(failedStocks, null, 2));
    console.log('📁 Failed slugs saved to failed_stocks.json');
  }
  console.log('==========================================');
}

// Run the script
generateHeavyContent().catch(console.error);
