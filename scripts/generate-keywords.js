// scripts/generate-keywords.js
// Generate SEO keywords for each stock (with optional AI enhancement)

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// ========== CONFIGURATION ==========
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // optional, for AI keywords
const USE_AI_ENHANCEMENT = false; // set to true if you want AI to generate better keywords (requires OpenAI key)

const BATCH_SIZE = 10;             // insert keywords for this many stocks in one batch
const RATE_LIMIT_MS = 200;         // delay between stocks
const CHECKPOINT_FILE = 'keywords_generation_checkpoint.json';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper to load checkpoint
function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
      console.log(`📌 Resuming from slug: ${data.lastSlug || 'none'}`);
      return data.lastSlug || null;
    } catch (e) { return null; }
  }
  return null;
}

function saveCheckpoint(slug) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastSlug: slug }, null, 2));
}

// Generate keywords for a single stock (template-based)
function generateKeywordsTemplate(stock) {
  const { name, symbol } = stock;
  const base = name.trim();
  const sym = symbol;

  return [
    `${base} share price target 2025`,
    `${base} share price target 2026`,
    `${base} share price target 2027`,
    `${base} share price target 2030`,
    `${base} share price target 2040`,
    `${base} share price target 2050`,
    `${base} price prediction 2026`,
    `${base} target price 2027`,
    `is ${base} good for long term`,
    `${base} share target price in hindi`,
    `why ${base} share is falling today`,
    `why ${base} share is rising today`,
    `${base} dividend record date 2026`,
    `${base} bonus share news`,
    `${base} multibagger target`,
    `expert view on ${base} share`,
    `intrinsic value of ${base} stock`,
    `nse ${sym} target price`,
    `${base} share price target for tomorrow`,
    `buy or sell ${base} share today`,
    `${base} q3 results update`,
    `top share price target ${base}`
  ];
}

// Optional: enhance keywords using AI (if enabled)
async function enhanceWithAI(name, symbol) {
  if (!USE_AI_ENHANCEMENT || !OPENAI_API_KEY) return null;
  const axios = require('axios');
  const prompt = `Generate 20 unique SEO keywords for the stock "${name}" (${symbol}). Provide only the keywords, one per line, no numbering, no extra text. Focus on long-tail, questions, and intent-based phrases.`;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }, {
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
    });
    const content = response.data.choices[0].message.content;
    return content.split('\n').filter(k => k.trim().length > 0);
  } catch (err) {
    console.warn(`⚠️ AI enhancement failed for ${name}, using template.`);
    return null;
  }
}

// Insert keywords for a batch of stocks
async function insertBatch(keywordsBatch) {
  if (keywordsBatch.length === 0) return;
  // Use upsert to avoid duplicates (requires unique constraint on (stock_slug, keyword))
  const { error } = await supabase
    .from('stock_keywords')
    .upsert(keywordsBatch, { onConflict: 'stock_slug,keyword', ignoreDuplicates: true });
  if (error) {
    console.error('Batch insert error:', error.message);
    return false;
  }
  return true;
}

// Main function
async function automateKeywords() {
  console.log('🚀 Fetching all stocks...');
  const { data: stocks, error } = await supabase
    .from('stocks')
    .select('slug, name, symbol')
    .order('name', { ascending: true });

  if (error || !stocks) {
    console.error('❌ Failed to fetch stocks:', error?.message);
    process.exit(1);
  }
  console.log(`📊 Total stocks: ${stocks.length}`);

  const lastSlug = loadCheckpoint();
  let startIndex = 0;
  if (lastSlug) {
    const idx = stocks.findIndex(s => s.slug === lastSlug);
    if (idx !== -1) startIndex = idx + 1;
    else console.warn('⚠️ Checkpoint slug not found, starting from beginning');
  }

  const batches = [];
  let currentBatch = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = startIndex; i < stocks.length; i++) {
    const stock = stocks[i];
    console.log(`\n📝 [${i+1}/${stocks.length}] Generating keywords for ${stock.name} (${stock.slug})`);

    let keywords = generateKeywordsTemplate(stock);
    // Optionally try AI
    const aiKeywords = await enhanceWithAI(stock.name, stock.symbol);
    if (aiKeywords && aiKeywords.length) keywords = aiKeywords;

    // Deduplicate within this stock
    keywords = [...new Set(keywords)];

    // Create objects for insertion
    const keywordObjs = keywords.map(kw => ({
      stock_slug: stock.slug,
      keyword: kw,
      search_intent: 'seo_optimized'
    }));

    currentBatch.push(...keywordObjs);
    successCount++;

    // Flush batch when size reached
    if (currentBatch.length >= BATCH_SIZE * 10) { // each stock gives ~20 keywords, so BATCH_SIZE=10 -> ~200 keyword objects
      const ok = await insertBatch(currentBatch);
      if (ok) currentBatch = [];
      else failCount++;
    }

    saveCheckpoint(stock.slug);
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
  }

  // Insert remaining
  if (currentBatch.length) {
    await insertBatch(currentBatch);
  }

  console.log('\n========== KEYWORD GENERATION COMPLETE ==========');
  console.log(`✅ Successfully processed: ${successCount} stocks`);
  if (failCount) console.log(`❌ Failed: ${failCount} stocks`);
  console.log('================================================');
}

automateKeywords().catch(console.error);
