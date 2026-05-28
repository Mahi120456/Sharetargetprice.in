import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import fs from 'fs';
import WebSocket from 'ws';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: { transport: WebSocket }
  }
);

// ---------- Load Balancer for 4 Groq API Keys ----------
const keys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
].filter(Boolean);
let currentKeyIndex = 0;

function getNextGroqClient() {
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex++;
  return new Groq({ apiKey: key });
}

// ---------- Short Slug Generator ----------
function getShortSlug(name) {
  let slug = name
    .toLowerCase()
    .replace(/ - direct plan( - growth)?/gi, '')
    .replace(/ - growth option/gi, '')
    .replace(/ fund/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (slug.length > 35) slug = slug.substring(0, 35).replace(/-$/, '');
  return slug;
}

// ---------- Build Prompt ----------
function buildPrompt(f1, f2) {
  const topHoldingsStr = (holdings) => {
    if (!holdings) return 'N/A';
    return holdings.split('|').slice(0, 3).map(h => h.trim()).join(', ');
  };
  return `You are a senior SEBI-registered financial advisor writing for Indian investors.
You MUST use ONLY the data given below. NEVER invent any number, fact, or external knowledge.
If a data point is missing, write "N/A". Write in natural Hinglish (Hindi words in English script) – friendly, conversational, and expert.
Use short paragraphs (2-3 lines). Use occasional fillers like "dekho", "chaliye", "haan", "lekin", "sach ye hai".
Never use markdown. Output HTML directly. Generate the 6 sections exactly with the headings shown.

Fund A: ${f1.scheme_name}
- Category: ${f1.category}
- 1Y return: ${f1.returns_1y ?? 'N/A'}%
- 3Y return: ${f1.returns_3y ?? 'N/A'}%
- 5Y return: ${f1.returns_5y ?? 'N/A'}%
- Riskometer: ${f1.riskometer}
- Volatility: ${f1.volatility ?? 'N/A'}
- Sharpe ratio: ${f1.sharpe_ratio ?? 'N/A'}
- Expense ratio: ${f1.expense_ratio ?? 'N/A'}%
- AUM: ${f1.aum ?? 'N/A'} Cr
- Asset allocation: ${f1.asset_allocation || 'N/A'}
- Top 3 holdings: ${topHoldingsStr(f1.top_holdings)}

Fund B: ${f2.scheme_name}
- Category: ${f2.category}
- 1Y return: ${f2.returns_1y ?? 'N/A'}%
- 3Y return: ${f2.returns_3y ?? 'N/A'}%
- 5Y return: ${f2.returns_5y ?? 'N/A'}%
- Riskometer: ${f2.riskometer}
- Volatility: ${f2.volatility ?? 'N/A'}
- Sharpe ratio: ${f2.sharpe_ratio ?? 'N/A'}
- Expense ratio: ${f2.expense_ratio ?? 'N/A'}%
- AUM: ${f2.aum ?? 'N/A'} Cr
- Asset allocation: ${f2.asset_allocation || 'N/A'}
- Top 3 holdings: ${topHoldingsStr(f2.top_holdings)}

Now write these 6 sections. Use the exact heading tags. Do not add extra commentary.

[INTRO]
<h2>📝 Introduction</h2>
<p>A short intro comparing the two funds' categories and what the reader will learn (80-100 words).</p>

[VERDICT]
<h2>🤖 Our Verdict – Which Fund is Better?</h2>
<p>Give a clear winner for long‑term wealth creation based on 3Y return, expense ratio, and risk. Write in a balanced, helpful tone.</p>

[SIP_SUITABILITY]
<h2>📈 SIP Suitability</h2>
<p>Which fund is better for a monthly SIP for 10+ years? Compare consistency and return stability.</p>

[RISK_COST]
<h2>⚠️ Risk & Cost Analysis</h2>
<p>Compare riskometer, volatility, Sharpe ratio, expense ratio. Tell which offers better risk‑adjusted returns.</p>

[PORTFOLIO_INSIGHT]
<h2>📊 Portfolio Diversification</h2>
<p>Compare asset allocation and top holdings concentration. Which is more diversified? Which has sector risk?</p>

[FAQ]
<h2>❓ Frequently Asked Questions</h2>
<div itemscope itemtype="https://schema.org/FAQPage">
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 itemprop="name">Q1: Which fund gives better returns in the long run?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><div itemprop="text"><p>Answer based on 5Y/3Y returns.</p></div></div>
</div>
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 itemprop="name">Q2: Is the higher risk fund worth it?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><div itemprop="text"><p>Answer comparing volatility and Sharpe ratio.</p></div></div>
</div>
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 itemprop="name">Q3: Which fund is more cost‑effective?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><div itemprop="text"><p>Answer comparing expense ratio and exit load (if provided).</p></div></div>
</div>
</div>
`;
}

// ---------- Parse AI Response ----------
function parseSections(rawHtml, slug) {
  const sections = { slug, intro: '', verdict: '', sip_suitability: '', risk_cost: '', portfolio_insight: '', faq: '' };
  const introMatch = rawHtml.match(/<h2>📝 Introduction<\/h2>([\s\S]*?)(?=<h2>🤖 Our Verdict|$)/i);
  if (introMatch) sections.intro = introMatch[1].trim();
  const verdictMatch = rawHtml.match(/<h2>🤖 Our Verdict – Which Fund is Better\?<\/h2>([\s\S]*?)(?=<h2>📈 SIP Suitability|$)/i);
  if (verdictMatch) sections.verdict = verdictMatch[1].trim();
  const sipMatch = rawHtml.match(/<h2>📈 SIP Suitability<\/h2>([\s\S]*?)(?=<h2>⚠️ Risk & Cost Analysis|$)/i);
  if (sipMatch) sections.sip_suitability = sipMatch[1].trim();
  const riskMatch = rawHtml.match(/<h2>⚠️ Risk & Cost Analysis<\/h2>([\s\S]*?)(?=<h2>📊 Portfolio Diversification|$)/i);
  if (riskMatch) sections.risk_cost = riskMatch[1].trim();
  const portfolioMatch = rawHtml.match(/<h2>📊 Portfolio Diversification<\/h2>([\s\S]*?)(?=<h2>❓ Frequently Asked Questions|$)/i);
  if (portfolioMatch) sections.portfolio_insight = portfolioMatch[1].trim();
  const faqMatch = rawHtml.match(/<h2>❓ Frequently Asked Questions<\/h2>([\s\S]*?)$/i);
  if (faqMatch) sections.faq = faqMatch[1].trim();
  return sections;
}

// ---------- Generate For One Pair ----------
async function generateForPair(fund1, fund2, shortSlug) {
  const prompt = buildPrompt(fund1, fund2);
  const groq = getNextGroqClient();
  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an AI that strictly uses only the provided data. Never invent numbers, facts, or external knowledge. If data missing, say "N/A".' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',   // ✅ changed from deprecated model
      temperature: 0.7,
      max_tokens: 2000,
    });
    const raw = response.choices[0]?.message?.content || '';
    if (!raw || raw.length < 200) throw new Error('Empty or too short response');
    const sections = parseSections(raw, shortSlug);
    const { error } = await supabase.from('comparison_ai_content').upsert({
      slug: shortSlug,
      intro: sections.intro,
      verdict: sections.verdict,
      sip_suitability: sections.sip_suitability,
      risk_cost: sections.risk_cost,
      portfolio_insight: sections.portfolio_insight,
      faq: sections.faq,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'slug' });
    if (error) throw error;
    console.log(`✅ ${shortSlug}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed ${shortSlug}:`, err.message);
    return false;
  }
}

// ---------- Main ----------
async function main() {
  const { data: funds } = await supabase
    .from('mutual_funds')
    .select('slug, scheme_name, aum, category, returns_1y, returns_3y, returns_5y, riskometer, volatility, sharpe_ratio, expense_ratio, asset_allocation, top_holdings')
    .not('aum', 'is', null)
    .order('aum', { ascending: false })
    .limit(100);
  if (!funds || funds.length === 0) return;

  const fundsWithShort = funds.map(f => ({ ...f, shortSlug: getShortSlug(f.scheme_name) }));
  const pairs = [];
  for (let i = 0; i < fundsWithShort.length; i++) {
    for (let j = i+1; j < fundsWithShort.length; j++) {
      pairs.push({
        shortSlug: `${fundsWithShort[i].shortSlug}-vs-${fundsWithShort[j].shortSlug}`,
        fund1: fundsWithShort[i],
        fund2: fundsWithShort[j],
      });
    }
  }
  console.log(`Total pairs: ${pairs.length}`);

  const checkpointFile = 'comparison-ai-checkpoint.json';
  let processed = new Set();
  if (fs.existsSync(checkpointFile)) {
    const data = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    processed = new Set(data.processed || []);
  }

  let successCount = 0;
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if (processed.has(pair.shortSlug)) {
      console.log(`⏩ Skipping already processed: ${pair.shortSlug}`);
      continue;
    }
    const ok = await generateForPair(pair.fund1, pair.fund2, pair.shortSlug);
    if (ok) {
      processed.add(pair.shortSlug);
      successCount++;
    }
    if ((i+1) % 5 === 0) {
      fs.writeFileSync(checkpointFile, JSON.stringify({ processed: Array.from(processed) }, null, 2));
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`🎉 Done. Successfully generated ${successCount} out of ${pairs.length}`);
}

main().catch(console.error);
