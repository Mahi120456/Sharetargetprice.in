import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import WebSocket from 'ws';

dotenv.config();

// ======================================================
// SUPABASE + AI CLIENTS
// ======================================================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: { transport: WebSocket }
  }
);

// Initialize OpenAI (primary generator)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENA_API_KEY,
});

// ======================================================
// CONFIG
// ======================================================
const REQUEST_DELAY_MS = 2500;
const MAX_RETRIES = 3;
const CHECKPOINT_FILE = 'mf_checkpoint.json';
const CURRENT_YEAR = new Date().getFullYear();
const MIN_CONTENT_LENGTH = 5000;

// ======================================================
// CHECKPOINT
// ======================================================
function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  try {
    const raw = fs.readFileSync(CHECKPOINT_FILE, 'utf8');
    return JSON.parse(raw).lastSchemeCode || null;
  } catch {
    return null;
  }
}

function saveCheckpoint(code) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastSchemeCode: code }, null, 2));
}

// ======================================================
// RANDOMIZATION HELPERS
// ======================================================
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(percent) {
  return Math.random() * 100 < percent;
}

const usedIntros = [];
const usedCTAs = [];
const usedCalculatorLinks = [];
const usedCategoryLinks = [];
const usedDisclaimerStyles = [];
const usedFaqCounts = [];

function getUniqueRandomItem(arr, usedList, maxUsed = 5) {
  const available = arr.filter(item => !usedList.includes(item));
  if (available.length === 0) return arr[0];
  const chosen = available[Math.floor(Math.random() * available.length)];
  usedList.push(chosen);
  if (usedList.length > maxUsed) usedList.shift();
  return chosen;
}

const disclaimerStyles = [
  `<div class="bg-amber-50 border-l-4 border-amber-500 p-4 my-4 text-sm text-gray-700"><strong>⚠️ Disclaimer:</strong> Educational only. Mutual funds are subject to market risks. Past performance does not guarantee future returns. Consult your SEBI-registered advisor.</div>`,
  `<div class="bg-gray-100 p-4 rounded-lg my-4 text-xs text-gray-600"><strong>📢 Important Note:</strong> Data sourced from AMFI and fund factsheets. Returns are historical. Investments may go up or down.</div>`,
  `<div class="bg-blue-50 border border-blue-200 p-3 my-4 text-sm text-blue-800"><strong>ℹ️ For informational purposes only.</strong> Not investment advice. Please do your own research.</div>`
];

function getRandomDisclaimer() {
  return getUniqueRandomItem(disclaimerStyles, usedDisclaimerStyles);
}

function getRandomFaqCount() {
  const counts = [3, 4, 5];
  return getUniqueRandomItem(counts, usedFaqCounts);
}

const ctaPositions = ['before_faq', 'after_faq', 'before_proscons'];
function getRandomCTAPosition() {
  return ctaPositions[Math.floor(Math.random() * ctaPositions.length)];
}

function shouldIncludeTable() {
  return chance(40);
}

const introTemplates = [
  "arey namaste doston! aaj baat karenge {scheme_name} ki. chaliye bina time waste kiye samajhte hain.",
  "namaste sabko! {scheme_name} – naam toh suna hoga. aaiye, is fund ko acche se samajhte hain.",
  "doston, agar aap {scheme_name} mein invest kar rahe ho ya soch rahe ho, toh yeh poori post padhna.",
  "{scheme_name} – kya sahi hai, kya galat? chaliye data ke saath samajhte hain.",
  "Agar aap {scheme_name} mein invest kar rahe hain ya soch rahe hain, toh ye detailed analysis aapke liye hai.",
  "{scheme_name} ek popular mutual fund hai. Is article mein hum iski performance, holdings, aur long-term potential ka gahraai se analysis karenge.",
  "Mutual funds mein invest karte waqt, fund ka past performance aur risk profile samajhna bahut zaroori hai. {scheme_name} ke baare mein yah sab kuch jaaniye.",
  "Niveshak ke taur par, aapko sirf returns nahi, balki fund ki strategy, risk, aur consistency bhi dekhni chahiye. {scheme_name} ka yahi unbiased review hai.",
  "Kya {scheme_name} aapke portfolio mein fit baithta hai? Is article mein hum iske har pehlu ko detail mein samjhenge."
];

function getRandomIntro(schemeName) {
  return getUniqueRandomItem(introTemplates, usedIntros).replace('{scheme_name}', schemeName);
}

const ctaTemplates = [
  "toh doston, lambe samay ke liye {scheme_name} ek accha option ho sakta hai. bas apna risk samjho aur advisor se salah lo.",
  "bas yahi tha {scheme_name} ka review. ummeed hai ab samajh aa gaya hoga. apna research zaroor karna.",
  "main toh yahi kahunga – SIP lagao, dhairya rakho, lambi avadhi mein malamal ho jaoge. {scheme_name} ek raasta ho sakta hai.",
  "Agar aap long-term wealth creation ke liye mutual funds mein invest kar rahe hain, toh {scheme_name} ek strong contender ho sakta hai. Lekin hamesha apne financial advisor se consult karein.",
  "Nivesh ka decision lene se pehle, apne risk appetite aur financial goals ko samajhna zaroori hai. Is fund ka detailed analysis use karein, lekin final decision advisor se lein.",
  "Yeh fund kisi specific investor ke liye suitable ho bhi sakta hai aur nahi bhi. Is article ko ek guide ki tarah use karein, aur professional advice zaroor lein.",
  "Long-term mein, disciplined investing aur diversification hi real wealth create karte hain. {scheme_name} ek option ho sakta hai, par apni situation ke hisaab se sochiye."
];

function getRandomCTA(schemeName) {
  return getUniqueRandomItem(ctaTemplates, usedCTAs).replace('{scheme_name}', schemeName);
}

const calculatorLinks = [
  '/calculator/sip-calculator',
  '/calculator/lumpsum-calculator',
  '/calculator/step-up-sip-calculator',
  '/calculator/swp-calculator',
  '/calculator/cagr-calculator'
];

function getRandomCalculatorLink() {
  return getUniqueRandomItem(calculatorLinks, usedCalculatorLinks);
}

const categoryLinkVariations = [
  "/mutual-funds/category/{category}",
  "/mutual-funds?category={category}",
  "/category/mutual-funds?cat={category}"
];

function getRandomCategoryLink(category) {
  const template = getUniqueRandomItem(categoryLinkVariations, usedCategoryLinks);
  return template.replace('{category}', (category || 'mutual-funds').toLowerCase().replace(/ /g, '-'));
}

const sectionOrders = [
  ['overview', 'performance', 'portfolio', 'risk', 'outlook', 'proscons', 'faq', 'conclusion'],
  ['overview', 'risk', 'portfolio', 'performance', 'outlook', 'proscons', 'faq', 'conclusion'],
  ['overview', 'portfolio', 'performance', 'risk', 'outlook', 'faq', 'proscons', 'conclusion']
];

function getSectionOrder() {
  return sectionOrders[Math.floor(Math.random() * sectionOrders.length)];
}

// ======================================================
// HEADING VARIATIONS (with Hinglish touch)
// ======================================================
function getHeadingVariations(fund) {
  const name = fund.scheme_name;
  const shortName = name.length > 60 ? name.substring(0, 57) + '...' : name;
  return {
    overview: [
      `${shortName} – Poora parichay aur strategy`,
      `${shortName} overview and fund details`,
      `${shortName} complete review for investors`,
      `${shortName} investment objective and strategy`
    ],
    performance: [
      `${shortName} ke returns – 1, 3, 5 saal ke aankde`,
      `${shortName} returns analysis ${CURRENT_YEAR}`,
      `${shortName} historical performance and returns`,
      `${shortName} yearly return performance`
    ],
    portfolio: [
      `${shortName} ke top holdings aur portfolio`,
      `${shortName} top holdings and portfolio allocation`,
      `${shortName} portfolio breakdown for investors`
    ],
    risk: [
      `${shortName} – risk level aur volatility`,
      `${shortName} risk analysis and volatility`,
      `${shortName} riskometer and downside risk`
    ],
    outlook: [
      `${shortName} – aage kya? (long term outlook)`,
      `${shortName} future outlook for long term investors`,
      `${shortName} long term investment outlook`
    ],
    proscons: [
      `${shortName} – fayde aur nuksan`,
      `${shortName} pros and cons for investors`,
      `${shortName} advantages and disadvantages`
    ],
    faq: [
      `${shortName} – aksar puche jaane wale sawaal (FAQs)`,
      `${shortName} FAQs for beginners`,
      `common questions about ${shortName}`
    ],
    conclusion: [
      `${shortName} – aakhri rai (Conclusion)`,
      `Final verdict on ${shortName}`,
      `Should you invest in ${shortName}? Final take`
    ]
  };
}

function getRandomHeading(variationsArray) {
  return random(variationsArray);
}

// ======================================================
// PROMPT BUILDER (Merged - Working style + Hinglish flavor)
// ======================================================
function buildPrompt(fund, intro, cta, order, randomCalcLink, randomCatLink, includeTable, disclaimer, faqCount, ctaPosition) {
  const headingVars = getHeadingVariations(fund);
  const headings = {
    overview: getRandomHeading(headingVars.overview),
    performance: getRandomHeading(headingVars.performance),
    portfolio: getRandomHeading(headingVars.portfolio),
    risk: getRandomHeading(headingVars.risk),
    outlook: getRandomHeading(headingVars.outlook),
    proscons: getRandomHeading(headingVars.proscons),
    faq: getRandomHeading(headingVars.faq),
    conclusion: getRandomHeading(headingVars.conclusion)
  };

  const sectionMap = {
    overview: `${headings.overview} (150-200 words): Fund ka objective, category, investment style, aur kis type ke investor ke liye suitable hai. Use Hinglish naturally.`,
    performance: `${headings.performance} (250-300 words): Compare 1Y, 3Y, 5Y returns with benchmark. Discuss consistency, volatility, fund manager impact. ${includeTable ? 'Include a simple HTML table comparing fund vs benchmark returns.' : 'Use paragraphs, no table.'} Use H3 subheadings.`,
    portfolio: `${headings.portfolio} (200-250 words): Top holdings, sector allocation, aur ye fund ki strategy se kaise align karta hai. Use H3 subheadings.`,
    risk: `${headings.risk} (150-200 words): Riskometer, volatility, Sharpe ratio (if available), aur kis risk profile ke liye suitable hai. Use H3 subheadings.`,
    outlook: `${headings.outlook} (200-250 words): Possible trends, historical positioning, sector exposure. Avoid exact return predictions. Use "could", "may", "historically". Mention "Updated in May ${CURRENT_YEAR}" naturally. Use H3 subheadings.`,
    proscons: `${headings.proscons}: At least 4 pros and 3 cons as HTML <ul>.`,
    faq: `${headings.faq} (${faqCount} questions). For each question, answer directly in the first 40-60 words to help featured snippets. Use complete FAQ schema HTML with itemscope, itemtype, itemprop. Include: beginner questions, SIP related, risk related, tax related.`,
    conclusion: `${headings.conclusion} (120-150 words): Give a balanced final verdict covering suitable investor type, risk level, investment horizon, SIP suitability.`
  };

  let sectionsInstruction = '';
  for (let i = 0; i < order.length; i++) {
    const key = order[i];
    sectionsInstruction += `${i+1}. ${sectionMap[key]}\n`;
  }

  let ctaPlacement = '';
  if (ctaPosition === 'before_faq') {
    ctaPlacement = `Place the CTA "${cta}" just before the FAQ section.`;
  } else if (ctaPosition === 'after_faq') {
    ctaPlacement = `Place the CTA "${cta}" at the very end of the article, after the conclusion.`;
  } else {
    ctaPlacement = `Place the CTA "${cta}" after the ${order.includes('proscons') ? 'pros & cons' : 'performance'} section.`;
  }

  let topHoldingsStr = '';
  if (fund.top_holdings) {
    const holdings = fund.top_holdings.split('|').slice(0,5).map(h => h.trim());
    topHoldingsStr = holdings.join(', ');
  } else {
    topHoldingsStr = 'Not available';
  }

  const primaryKeyword = `${fund.scheme_name} review ${CURRENT_YEAR}`;
  const secondaryKeywords = [
    `${fund.scheme_name} returns`,
    `${fund.scheme_name} NAV`,
    `${fund.scheme_name} holdings`,
    `${fund.scheme_name} risk`,
    `${fund.scheme_name} expense ratio`,
    `${fund.scheme_name} direct growth`
  ];
  const semanticKeywords = ['equity mutual fund', 'SIP investing', 'wealth creation', 'market volatility', 'long term investing', 'portfolio diversification', 'high growth mutual fund'];
  const nlpEntities = ['mutual fund NAV', 'expense ratio', 'CAGR returns', 'fund manager', 'equity allocation', 'SIP returns', 'AUM growth'];

  return `
You are Mahendra, a senior financial content writer for an Indian mutual fund website. Write a unique, engaging article of **1200-1800 words**.
**CRITICAL LANGUAGE STYLE INSTRUCTION:**
- 80% Hinglish (Write Hindi words using the English/Roman alphabet) + 20% English (only for technical terms like NAV, AUM, SIP, CAGR, returns, volatility, expense ratio, benchmark).
- DO NOT use Devanagari script. ONLY use Roman/Latin script (a, b, c).
- Example: "mera naam Mahendra hai, main ek financial expert hu" – aise likh.
- Use natural fillers: "arey", "dekho", "bilkul", "haan", "chaliye", "maine dekha hai", "aapne socha hoga?".
- Use rhetorical questions: "kyun? chaliye samajhte hain", "kya aapko lagta hai ye sahi hai?".
- Tone: professional yet friendly, informative but not robotic. Write like an experienced finance blogger, not a robot.

**IMPORTANT: DO NOT invent any facts. If any data point is not available, write "data not available".**

**Keyword usage:**
- Primary keyword: "${primaryKeyword}" – use naturally 12-18 times across the article (density ~1.3-1.4%)
- Secondary keywords: ${secondaryKeywords.join(', ')} – use naturally.
- Semantic keywords: ${semanticKeywords.join(', ')} – sprinkle naturally.
- NLP entities: ${nlpEntities.join(', ')} – use naturally where relevant.

**Readability:** Keep sentences concise, mobile‑friendly. Short paragraphs (2-4 lines max). Avoid long text walls.

**Fund Data:**
- Scheme: ${fund.scheme_name}
- Fund House: ${fund.fund_house}
- Category: ${fund.category}
- AUM: ₹${fund.aum} Cr
- Expense Ratio: ${fund.expense_ratio}%
- 1Y Return: ${fund.returns_1y}%
- 3Y Return: ${fund.returns_3y}%
- 5Y Return: ${fund.returns_5y}%
- Riskometer: ${fund.riskometer}
- Fund Manager: ${fund.fund_manager} (tenure: ${fund.fund_manager_tenure})
- Top 5 holdings: ${topHoldingsStr}
- Benchmark: ${fund.benchmark}

**Article Sections (follow this order):**
${sectionsInstruction}

**For each section, use the exact heading (as HTML <h2>):**
- Overview: "${headings.overview}"
- Performance: "${headings.performance}"
- Portfolio: "${headings.portfolio}"
- Risk: "${headings.risk}"
- Outlook: "${headings.outlook}"
- Pros & Cons: "${headings.proscons}"
- FAQ: "${headings.faq}"
- Conclusion: "${headings.conclusion}"

**Additional Elements:**
- Start with a single H1 heading: "<h1>${fund.scheme_name} Review ${CURRENT_YEAR}</h1>"
- Start with the intro: "${intro}"
- End with the CTA: "${cta}"
- After the introduction, add a small table of contents with anchor links to each H2 section (use <div class="table-of-contents"> with <ul> and <li>).
- After the introduction, also add an author credibility note:
  <div class="author-note bg-gray-100 p-3 rounded-lg text-sm">
    Reviewed by Mahendra Maurya, Relationship Manager with 6+ years experience in Banking & Financial Services.
  </div>
- After the performance section, add this disclaimer exactly:
  ${disclaimer}
- Occasionally compare with similar category mutual funds.
- Include a practical investor perspective where relevant (e.g., "Investors looking for long-term SIP exposure may find this suitable...").

**Internal Links (do not repeat any link more than once):**
- <a href="${randomCatLink}">${fund.category} Funds</a>
- <a href="/mutual-funds/amc/${fund.fund_house.toLowerCase().replace(/ /g, '-')}">${fund.fund_house}</a>
- <a href="${randomCalcLink}">SIP Calculator</a>
- <a href="/mutual-funds/best-small-cap-funds">Best Small Cap Funds</a> (if applicable)
- <a href="/mutual-funds/top-performing-funds">Top Performing Funds</a>

**If comparing benchmark returns, use a clean HTML table.**

**WRAPPING INSTRUCTIONS – VERY IMPORTANT**
Wrap EVERY section (including introduction paragraph and conclusion) with the following markers:

<!--SECTION:overview-->
(content of overview section)
<!--END-->

<!--SECTION:performance-->
(content)
<!--END-->

... similarly for portfolio, risk, outlook, proscons, faq, conclusion.

Do NOT miss any section. Markers must be exactly as shown.

**Additional metadata (output after all sections, each with its marker):**
<!--META_TITLES_START-->
Generate 3 CTR-focused SEO title options (50-60 chars each) in Hinglish:
- Include primary keyword naturally
- Include year ${CURRENT_YEAR}
- Keep emotional + search intent optimized
- Example: "${fund.scheme_name} SIP Review ${CURRENT_YEAR}: Sahi hai ya nahi?"
<!--META_TITLES_END-->

<!--META_DESCRIPTION_START-->
Generate one SEO meta description (120-160 characters) in Hinglish. Include primary keyword and year. Make it CTR-optimized.
<!--META_DESCRIPTION_END-->

<!--THUMBNAIL_PROMPT_START-->
Write a short prompt (max 100 words) for generating a finance-style thumbnail image. Include: fund name, category, key return, risk level.
<!--THUMBNAIL_PROMPT_END-->

<!--OG_IMAGE_PROMPT_START-->
Write a short prompt for an Open Graph image (1200x630) highlighting the fund's 1Y return and category.
<!--OG_IMAGE_PROMPT_END-->

<!--SOCIAL_CAPTION_START-->
Write a tweet (max 280 chars) and a LinkedIn post (max 600 chars) to promote this article in Hinglish.
Format: TWEET: ... | LINKEDIN: ...
<!--SOCIAL_CAPTION_END-->

<!--IMAGE_ALT_START-->
Generate SEO optimized image alt text (3-4 variations) for the fund's thumbnail/featured image.
<!--IMAGE_ALT_END-->

**Humanization & Snippet Optimization:**
- Use conversational transitions occasionally.
- Vary sentence rhythm – mix short and medium sentences.
- Avoid perfectly structured patterns.
- Slightly imperfect sentence flow is acceptable.
- In FAQ answers, answer the question directly in the first 40-60 words to help featured snippets.

**Output:** ONLY valid HTML. No markdown, no code fences. Start directly with <h1>.
`;
}

// ======================================================
// HELPER FUNCTIONS
// ======================================================
function sanitizeHTML(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['table', 'thead', 'tbody', 'tr', 'td', 'th', 'meta']),
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      div: ['class', 'itemscope', 'itemtype', 'itemprop'],
      h2: ['itemprop'],
      h3: ['itemprop'],
      meta: ['itemprop', 'content'],
      span: ['class'],
      p: ['class']
    }
  });
}

async function retryApiCall(fn, retries = MAX_RETRIES, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        const wait = delay * Math.pow(2, i);
        console.log(`Rate limited. Retrying after ${wait}ms...`);
        await new Promise(resolve => setTimeout(resolve, wait));
        continue;
      }
      throw error;
    }
  }
}

// ======================================================
// OPENAI GENERATION
// ======================================================
async function generateWithOpenAI(prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are Mahendra, a senior financial content writer for Indian mutual funds. Write in Hinglish (Hindi words in English alphabet).' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 4500,
  });
  const text = response.choices[0]?.message?.content;
  if (!text || text.length < 3000) throw new Error('Generated content too short');
  return text;
}

function extractSection(html, sectionName) {
  const regex = new RegExp(`<!--SECTION:${sectionName}-->([\\s\\S]*?)<!--END-->`, 'i');
  const match = html.match(regex);
  if (match) return sanitizeHTML(match[1].trim());
  return '';
}

// Fallback extraction using headings
function extractSectionByHeading(html, headingKeyword) {
  const regex = new RegExp(`<h2[^>]*>.*?${headingKeyword}.*?</h2>([\\s\\S]*?)(?=<h2|$)`, 'i');
  const match = html.match(regex);
  if (match && match[1]) {
    return sanitizeHTML(match[1].trim());
  }
  return '';
}

function extractExtra(html, markerStart, markerEnd) {
  const regex = new RegExp(`${markerStart}([\\s\\S]*?)${markerEnd}`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

function computeHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// ======================================================
// MAIN GENERATION FUNCTION (per fund)
// ======================================================
async function generateContentForFund(fund) {
  console.log(`\n✍️ Writing for: ${fund.scheme_name}`);

  const intro = getRandomIntro(fund.scheme_name);
  const cta = getRandomCTA(fund.scheme_name);
  const order = getSectionOrder();
  const randomCalcLink = getRandomCalculatorLink();
  const randomCatLink = getRandomCategoryLink(fund.category);
  const includeTable = shouldIncludeTable();
  const disclaimer = getRandomDisclaimer();
  const faqCount = getRandomFaqCount();
  const ctaPosition = getRandomCTAPosition();

  const prompt = buildPrompt(fund, intro, cta, order, randomCalcLink, randomCatLink, includeTable, disclaimer, faqCount, ctaPosition);

  let rawHtml;
  try {
    rawHtml = await retryApiCall(() => generateWithOpenAI(prompt));
  } catch (err) {
    console.error(`OpenAI generation failed: ${err.message}`);
    return false;
  }

  // Try to extract sections using markers first, fallback to heading-based extraction
  let overview = extractSection(rawHtml, 'overview');
  let performance = extractSection(rawHtml, 'performance');
  let portfolio = extractSection(rawHtml, 'portfolio');
  let risk = extractSection(rawHtml, 'risk');
  let outlook = extractSection(rawHtml, 'outlook');
  let proscons = extractSection(rawHtml, 'proscons');
  let faq = extractSection(rawHtml, 'faq');
  let conclusion = extractSection(rawHtml, 'conclusion');

  if (!overview) overview = extractSectionByHeading(rawHtml, 'पूरा परिचय|parichay|strategy|overview');
  if (!performance) performance = extractSectionByHeading(rawHtml, 'रिटर्न|returns|aankde|performance');
  if (!portfolio) portfolio = extractSectionByHeading(rawHtml, 'होल्डिंग्स|portfolio');
  if (!risk) risk = extractSectionByHeading(rawHtml, 'रिस्क|risk');
  if (!outlook) outlook = extractSectionByHeading(rawHtml, 'आगे क्या|outlook');
  if (!proscons) proscons = extractSectionByHeading(rawHtml, 'फायदे और नुकसान|fayde aur nuksan|pros');
  if (!faq) faq = extractSectionByHeading(rawHtml, 'अक्सर पूछे|FAQs|sawaal');
  if (!conclusion) conclusion = extractSectionByHeading(rawHtml, 'आखिरी राय|conclusion');

  // Provide fallback content for any missing sections
  const fallback = (section) => section && section.length > 0 ? section : '<p>Content coming soon.</p>';
  overview = fallback(overview);
  performance = fallback(performance);
  portfolio = fallback(portfolio);
  risk = fallback(risk);
  outlook = fallback(outlook);
  proscons = fallback(proscons);
  faq = fallback(faq);
  conclusion = fallback(conclusion);

  const performance_analysis = performance;
  const portfolio_analysis = portfolio;
  const risk_analysis = risk;
  const analysis = `${performance_analysis}\n\n${portfolio_analysis}\n\n${risk_analysis}`.trim();

  // Metadata extraction (both marker and plain text formats)
  let altTitles = [];
  const altTitlesMarker = extractExtra(rawHtml, '<!--META_TITLES_START-->', '<!--META_TITLES_END-->');
  if (altTitlesMarker) {
    altTitles = altTitlesMarker.split('\n').filter(t => t.trim().length > 0).slice(0, 3);
  } else {
    // Fallback to plain text metadata section
    const metadataMatch = rawHtml.match(/---METADATA---([\s\S]*?)$/i);
    if (metadataMatch) {
      const metadata = metadataMatch[1];
      const titleMatch = metadata.match(/SEO TITLES:?([\s\S]*?)(?=META DESCRIPTION|$)/i);
      if (titleMatch) {
        altTitles = titleMatch[1].split('\n').filter(l => l.trim() && !l.includes('SEO TITLE')).slice(0, 3);
      }
    }
  }
  
  let metaDescription = extractExtra(rawHtml, '<!--META_DESCRIPTION_START-->', '<!--META_DESCRIPTION_END-->');
  if (!metaDescription) {
    const metadataMatch = rawHtml.match(/---METADATA---([\s\S]*?)$/i);
    if (metadataMatch) {
      const metaMatch = metadataMatch[1].match(/META DESCRIPTION:?\s*([^\n]+)/i);
      if (metaMatch) metaDescription = metaMatch[1].trim();
    }
  }

  const thumbnailPrompt = extractExtra(rawHtml, '<!--THUMBNAIL_PROMPT_START-->', '<!--THUMBNAIL_PROMPT_END-->');
  const ogImagePrompt = extractExtra(rawHtml, '<!--OG_IMAGE_PROMPT_START-->', '<!--OG_IMAGE_PROMPT_END-->');
  let socialCaption = extractExtra(rawHtml, '<!--SOCIAL_CAPTION_START-->', '<!--SOCIAL_CAPTION_END-->');
  if (!socialCaption) {
    const metadataMatch = rawHtml.match(/---METADATA---([\s\S]*?)$/i);
    if (metadataMatch) {
      const socialMatch = metadataMatch[1].match(/SOCIAL CAPTION:?\s*([^\n]+)/i);
      if (socialMatch) socialCaption = socialMatch[1].trim();
    }
  }
  socialCaption = socialCaption?.substring(0, 800) || '';

  // Assemble full article
  let fullArticle = `
${overview}
${performance}
${portfolio}
${risk}
${outlook}
${proscons}
${faq}
${conclusion}
`.trim();

  fullArticle = fullArticle
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();

  if (fullArticle.length < MIN_CONTENT_LENGTH) {
    console.log(`⚠️ Content too short (${fullArticle.length} chars), skipping ${fund.scheme_name}`);
    return false;
  }

  const contentHash = computeHash(fullArticle);

  // Check for duplicate content
  const { data: existing } = await supabase
    .from('mutual_funds')
    .select('scheme_code')
    .eq('content_hash', contentHash)
    .maybeSingle();
  if (existing) {
    console.log(`⚠️ Duplicate content detected for ${fund.scheme_name}, skipping.`);
    return true;
  }

  if (altTitles.length && altTitles[0]) {
    altTitles[0] = `${altTitles[0]} | ${fund.fund_house}`;
  }

  const updateData = {
    overview: overview || null,
    analysis: analysis || null,
    future_outlook: outlook || null,
    pros_cons: proscons || null,
    faq: faq || null,
    performance_analysis: performance_analysis || null,
    portfolio_analysis: portfolio_analysis || null,
    risk_analysis: risk_analysis || null,
    full_article: fullArticle || null,
    content_hash: contentHash,
    social_caption: socialCaption || null,
    status: 'draft',
    published_at: null,
    thumbnail_prompt: thumbnailPrompt || null,
    og_image_prompt: ogImagePrompt || null,
    alternative_titles: altTitles.length ? altTitles : null
  };

  if (!fund.seo_title && altTitles[0]) updateData.seo_title = altTitles[0];
  if (!fund.seo_description && metaDescription) updateData.seo_description = metaDescription;

  const { error } = await supabase
    .from('mutual_funds')
    .update(updateData)
    .eq('scheme_code', fund.scheme_code);

  if (error) {
    console.error(`DB update failed for ${fund.scheme_name}:`, error.message);
    return false;
  }

  console.log(`✅ Completed ${fund.scheme_name}`);
  return true;
}

// ======================================================
// BATCH PROCESSOR
// ======================================================
async function main() {
  const batchSize = parseInt(process.env.BATCH_SIZE) || 10;
  const startFrom = process.env.START_FROM ? parseInt(process.env.START_FROM) : null;

  let query = supabase
    .from('mutual_funds')
    .select('*')
    .is('overview', null)
    .order('aum', { ascending: false });

  let funds;
  if (startFrom !== null) {
    const { data: all } = await query;
    funds = all ? all.slice(startFrom, startFrom + batchSize) : [];
  } else {
    const { data, error } = await query.limit(batchSize);
    if (error) throw error;
    funds = data;
  }

  if (!funds || funds.length === 0) {
    console.log('No funds need AI content. Exiting.');
    return;
  }

  console.log(`Processing batch of ${funds.length} funds (batch size ${batchSize})`);
  let success = 0, fail = 0;
  const lastCheckpoint = loadCheckpoint();
  let startIndex = 0;
  if (lastCheckpoint) {
    const idx = funds.findIndex(f => f.scheme_code === lastCheckpoint);
    if (idx !== -1) startIndex = idx + 1;
  }

  for (let i = startIndex; i < funds.length; i++) {
    const fund = funds[i];
    const ok = await generateContentForFund(fund);
    if (ok) {
      success++;
      saveCheckpoint(fund.scheme_code);
    } else {
      fail++;
    }
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
  }

  console.log(`\n========== BATCH COMPLETE ==========`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${fail}`);
  console.log(`====================================`);
}

main().catch(console.error);
