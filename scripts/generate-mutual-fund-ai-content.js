import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import WebSocket from 'ws';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { transport: WebSocket } }
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENA_API_KEY,
});

const REQUEST_DELAY_MS = 2500;
const MAX_RETRIES = 3;
const CHECKPOINT_FILE = 'mf_checkpoint.json';
const CURRENT_YEAR = new Date().getFullYear();
const MIN_CONTENT_LENGTH = 5000;

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  try {
    const raw = fs.readFileSync(CHECKPOINT_FILE, 'utf8');
    return JSON.parse(raw).lastSchemeCode || null;
  } catch { return null; }
}
function saveCheckpoint(code) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastSchemeCode: code }, null, 2));
}

// Hinglish intros and CTAs (Roman script)
const intros = [
  "arey namaste doston! aaj baat karenge {scheme_name} ki. chaliye bina time waste kiye samajhte hain.",
  "namaste sabko! {scheme_name} – naam toh suna hoga. aaiye, is fund ko acche se samajhte hain.",
  "doston, agar aap {scheme_name} mein invest kar rahe ho ya soch rahe ho, toh yeh poori post padhna.",
  "{scheme_name} – kya sahi hai, kya galat? chaliye data ke saath samajhte hain."
];
const ctas = [
  "toh doston, lambe samay ke liye {scheme_name} ek accha option ho sakta hai. bas apna risk samjho aur advisor se salah lo.",
  "bas yahi tha {scheme_name} ka review. ummeed hai ab samajh aa gaya hoga. apna research zaroor karna.",
  "main toh yahi kahunga – SIP lagao, dhairya rakho, lambi avadhi mein malamal ho jaoge. {scheme_name} ek raasta ho sakta hai."
];
function getRandomIntro(schemeName) {
  return intros[Math.floor(Math.random() * intros.length)].replace('{scheme_name}', schemeName);
}
function getRandomCTA(schemeName) {
  return ctas[Math.floor(Math.random() * ctas.length)].replace('{scheme_name}', schemeName);
}

const disclaimers = [
  `<div class="bg-amber-50 border-l-4 border-amber-500 p-4 my-4 text-sm"><strong>⚠️ Disclaimer:</strong> Education purpose only. Mutual funds are subject to market risks. Past performance doesn't guarantee future returns. Consult your advisor.</div>`,
  `<div class="bg-gray-100 p-4 rounded-lg my-4 text-xs text-gray-600"><strong>📢 Important:</strong> Data from AMFI and factsheets. Returns are historical. Investments may go up or down.</div>`
];
function getRandomDisclaimer() {
  return disclaimers[Math.floor(Math.random() * disclaimers.length)];
}

// ======================================================
// BUILD PROMPT – full Hinglish, Roman script, with desired title format
// ======================================================
function buildPrompt(fund) {
  const shortName = fund.scheme_name.length > 60 ? fund.scheme_name.substring(0,57)+'...' : fund.scheme_name;
  
  return `tu Mahendra hai, ek Indian finance blogger. Tu apne blog ke liye mutual fund ka review likh raha hai.

**TERA LIKHNE KA TARIKA (important):**
- 80% Hinglish (Hindi words but likh English alphabet mein) + 20% English (sirf technical words jaise NAV, AUM, SIP, CAGR, returns, volatility, expense ratio, benchmark).
- **Devnagari script mat use karna** – sirf Roman/Latin script (a, b, c).
- Example: "mera naam Mahendra hai, main ek financial expert hu" – aise likh.
- Chhote paragraphs – 2-3 lines se zyada mat kar. Har paragraph ke baad ek blank line.
- Use natural fillers: "arey", "dekho", "bilkul", "haan", "chaliye", "maine dekha hai", "aapne socha hoga?".
- Kabhi kabhi rhetorical questions pooch: "kyun? chaliye samajhte hain", "kya aapko lagta hai ye sahi hai?".
- "firstly, moreover, finally, in conclusion" mat likh. Use "sabse pehle", "ab aage badhte hain", "toh seedhi baat ye hai".
- SEO ke liye primary keyword "${fund.scheme_name} review ${CURRENT_YEAR}" 10-15 baar naturally use kar.

**FUND KA DATA (use karna throughout article):**
- Fund name: ${fund.scheme_name}
- Fund house: ${fund.fund_house}
- Category: ${fund.category}
- AUM: ₹${fund.aum} crore
- Expense ratio: ${fund.expense_ratio}%
- 1 year return: ${fund.returns_1y}%
- 3 year return: ${fund.returns_3y}%
- 5 year return: ${fund.returns_5y}%
- Risk level: ${fund.riskometer}
- Fund manager: ${fund.fund_manager} (${fund.fund_manager_tenure} years)
- Top 5 holdings: ${fund.top_holdings ? fund.top_holdings.split('|').slice(0,5).map(h=>h.trim()).join(', ') : 'N/A'}
- Benchmark: ${fund.benchmark || 'N/A'}

**AB POORA ARTICLE LIKH (HTML format mein). Koi Table of Contents nahi, koi author note nahi. Bas headings aur paragraphs.**

<h1>${fund.scheme_name} Review ${CURRENT_YEAR} – Sahi hai ya nahi?</h1>

<p>${getRandomIntro(fund.scheme_name)}</p>

<h2>${shortName} – Poora parichay aur strategy</h2>
<p>{fund ka objective, category, kis type ke investor ke liye suitable hai – 150-200 words, chhote paragraphs}</p>

<h2>${shortName} ke returns – 1, 3, 5 saal ke aankde</h2>
<p>{1Y,3Y,5Y returns benchmark se compare karo. Agar chahe toh chhota HTML table bana sakte ho. 250-300 words}</p>

<h2>${shortName} ke top holdings aur portfolio</h2>
<p>{top holdings, sector allocation – 200-250 words}</p>

<h2>${shortName} – risk level aur volatility</h2>
<p>{riskometer, volatility, Sharpe ratio – 150-200 words}</p>

<h2>${shortName} – aage kya? (long term outlook)</h2>
<p>{future possibilities, sectors se ummeedein – "lagta hai", "ho sakta hai" use karo. 200-250 words}</p>

<h2>${shortName} – fayde aur nuksan</h2>
<ul><li><strong>Fayde:</strong><ul><li>...kam se kam 4</li></ul></li><li><strong>Nuksan:</strong><ul><li>...kam se kam 3</li></ul></li></ul>

<h2>${shortName} – aksar puche jaane wale sawaal (FAQs)</h2>
<div itemscope itemtype="https://schema.org/FAQPage">
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 itemprop="name">sawaal?</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><p itemprop="text">javaab (seedha aur chhota)</p></div>
</div>
... (kam se kam 4 questions)
</div>

<h2>${shortName} – aakhri rai (Conclusion)</h2>
<p>{balanced verdict – 120-150 words, friendly tone}</p>

<p>${getRandomCTA(fund.scheme_name)}</p>

${getRandomDisclaimer()}

---METADATA---
SEO TITLES:
Generate 3 SEO title options exactly in this style (Hinglish, Roman script, 50-60 characters, include year ${CURRENT_YEAR} at end):
- Kya ${fund.scheme_name} Me SIP Karna Sahi Hai? Jane Pura Sach ${CURRENT_YEAR}
- ${fund.scheme_name} SIP Review ${CURRENT_YEAR}: Risk Kam Ya Return Zyada?
- SIP Start Karne Se Pehle Jane ${fund.scheme_name} Ki Ye Badi Baatein
- Kya ${fund.scheme_name} Long Term Investment Ke Liye Best Hai?
- ${fund.scheme_name} Me ₹5000 Ki SIP Kitna Return De Sakti Hai?
- Market Girne Par Bhi Safe Rahega? Jane ${fund.scheme_name} Ka Sach
- ${fund.scheme_name} Me Investment Karne Se Pehle Ye Zarur Padhein
- Beginners Ke Liye Kaisa Hai ${fund.scheme_name}? Full Analysis ${CURRENT_YEAR}
- ${fund.scheme_name} SIP Se Wealth Kaise Ban Sakti Hai? Detailed Review
- ${fund.scheme_name} Ka Complete Analysis: SIP Kare Ya Nahi? ${CURRENT_YEAR}

Pick 3 most relevant for this fund and list them line by line (no bullet points, just plain text, each on new line). Keep Hinglish, natural, include fund name and year.

META DESCRIPTION:
(120-160 chars, Hinglish, include primary keyword)

THUMBNAIL PROMPT:
(short prompt for image, Hinglish)

OG IMAGE PROMPT:
(short prompt)

SOCIAL CAPTION:
Tweet: (max 280 chars) | LinkedIn: (max 600 chars)

IMAGE ALT:
(3 variations)

Bas itna. Output sirf HTML do, uske baad ---METADATA--- aur metadata.`;
}

// ======================================================
// PARSE RESPONSE (same as before)
// ======================================================
function parseResponse(fullText) {
  const parts = fullText.split(/---METADATA---/i);
  const articleHtml = parts[0].trim();
  let metadataRaw = parts[1] ? parts[1].trim() : '';
  
  const getSection = (headingKeyword) => {
    const regex = new RegExp(`<h2[^>]*>.*?${headingKeyword}.*?</h2>([\\s\\S]*?)(?=<h2|$)`, 'i');
    const match = articleHtml.match(regex);
    return match ? match[1].trim() : '';
  };
  
  const overview = getSection('पूरा परिचय|parichay|strategy');
  const performance = getSection('रिटर्न|returns|aankde');
  const portfolio = getSection('होल्डिंग्स|portfolio');
  const risk = getSection('रिस्क|risk level');
  const outlook = getSection('आगे क्या|outlook');
  const proscons = getSection('फायदे और नुकसान|fayde aur nuksan');
  const faq = getSection('अक्सर पूछे|FAQs|sawaal');
  const conclusion = getSection('आखिरी राय|conclusion');
  
  const fallback = (section, defaultMsg) => section || `<p>${defaultMsg}</p>`;
  
  const getMeta = (label) => {
    const regex = new RegExp(`${label}:?\\s*([^\\n]+)`, 'i');
    const match = metadataRaw.match(regex);
    return match ? match[1].trim() : '';
  };
  
  const altTitles = [];
  const titleMatch = metadataRaw.match(/SEO TITLES:?([\s\S]*?)(?=META DESCRIPTION|$)/i);
  if (titleMatch) {
    const lines = titleMatch[1].split('\n').filter(l => l.trim() && !l.includes('SEO TITLE'));
    altTitles.push(...lines.slice(0,3).map(l => l.replace(/^-\s*/, '').trim()));
  }
  
  const metaDescription = getMeta('META DESCRIPTION');
  const thumbnailPrompt = getMeta('THUMBNAIL PROMPT');
  const ogImagePrompt = getMeta('OG IMAGE PROMPT');
  const socialCaption = getMeta('SOCIAL CAPTION');
  
  return {
    overview: fallback(overview, 'Overview coming soon.'),
    performance: fallback(performance, 'Performance data coming soon.'),
    portfolio: fallback(portfolio, 'Portfolio details coming soon.'),
    risk: fallback(risk, 'Risk analysis coming soon.'),
    outlook: fallback(outlook, 'Outlook coming soon.'),
    pros_cons: fallback(proscons, 'Pros and cons coming soon.'),
    faq: fallback(faq, 'FAQs coming soon.'),
    conclusion: fallback(conclusion, 'Conclusion coming soon.'),
    analysis: `${performance}\n\n${portfolio}\n\n${risk}`.trim(),
    full_article: articleHtml,
    altTitles,
    metaDescription,
    thumbnailPrompt,
    ogImagePrompt,
    socialCaption,
  };
}

// ======================================================
// OPENAI GENERATION
// ======================================================
async function generateWithOpenAI(prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Tu Mahendra hai, ek Indian finance blogger. Bilkul Hinglish me likh (English alphabet, Hindi words). Chhote paragraphs, natural, robot mat ban.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.95,
    top_p: 0.95,
    max_tokens: 4500,
  });
  const text = response.choices[0]?.message?.content;
  if (!text || text.length < 3000) throw new Error('Content too short');
  return text;
}

// ======================================================
// MAIN GENERATION FUNCTION
// ======================================================
async function generateContentForFund(fund) {
  console.log(`\n✍️ Writing for: ${fund.scheme_name}`);
  const prompt = buildPrompt(fund);
  let raw;
  try {
    raw = await generateWithOpenAI(prompt);
  } catch (err) {
    console.error(`Generation failed: ${err.message}`);
    return false;
  }
  
  const parsed = parseResponse(raw);
  const fullArticle = parsed.full_article;
  if (fullArticle.length < MIN_CONTENT_LENGTH) {
    console.log(`⚠️ Too short (${fullArticle.length}) – skipping`);
    return false;
  }
  
  const contentHash = crypto.createHash('sha256').update(fullArticle).digest('hex');
  const updateData = {
    overview: parsed.overview,
    analysis: parsed.analysis,
    future_outlook: parsed.outlook,
    pros_cons: parsed.pros_cons,
    faq: parsed.faq,
    full_article: fullArticle,
    content_hash: contentHash,
    social_caption: parsed.socialCaption?.substring(0,800) || null,
    thumbnail_prompt: parsed.thumbnailPrompt,
    og_image_prompt: parsed.ogImagePrompt,
    alternative_titles: parsed.altTitles.length ? parsed.altTitles : null,
    seo_description: parsed.metaDescription || null,
    status: 'draft',
  };
  
  const { error } = await supabase
    .from('mutual_funds')
    .update(updateData)
    .eq('scheme_code', fund.scheme_code);
  if (error) {
    console.error(`DB error: ${error.message}`);
    return false;
  }
  console.log(`✅ Done: ${fund.scheme_name}`);
  return true;
}

// ======================================================
// BATCH PROCESSOR
// ======================================================
async function main() {
  const batchSize = parseInt(process.env.BATCH_SIZE) || 5;
  const startFrom = process.env.START_FROM ? parseInt(process.env.START_FROM) : null;
  
  let query = supabase.from('mutual_funds').select('*').is('overview', null).order('aum', { ascending: false });
  let funds;
  if (startFrom !== null) {
    const { data: all } = await query;
    funds = all ? all.slice(startFrom, startFrom + batchSize) : [];
  } else {
    const { data, error } = await query.limit(batchSize);
    if (error) throw error;
    funds = data;
  }
  if (!funds || funds.length === 0) { console.log('No funds left.'); return; }
  
  console.log(`Batch of ${funds.length} funds`);
  let success = 0, fail = 0;
  for (let i = 0; i < funds.length; i++) {
    const ok = await generateContentForFund(funds[i]);
    if (ok) success++; else fail++;
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
  }
  console.log(`✅ ${success} | ❌ ${fail}`);
}

main().catch(console.error);
