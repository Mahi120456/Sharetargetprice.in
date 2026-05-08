// scripts/import-to-supabase.js
// Run: node scripts/import-to-supabase.js
// First: npm install @supabase/supabase-js dotenv

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for import
);

// Your WordPress posts extracted from backup
const posts = [
  {
    wp_id: 3777,
    title: "Share Target Price Calculations Guide 2025 Complete Beginner Guide",
    slug: "share-target-price-calculation-guide",
    excerpt: "Socho tumhare dimaag me ek simple sa sawaal hai: Ye share future me kitna tak ja sakta hai? Is guide me hum share target price calculate karna seekhenge.",
    content: "Share Target Price kya hota hai? Simple words me: Share Target Price = Woh price jahan hume logically lagta hai ki ek stock future me ja sakta hai. Ye koi random guess nahi hota, balki company ke numbers, valuation, growth, risk aur market sentiment ka mix hoke ek price aata hai.\n\n## Share Target Price ke Types\n\n**1. Trading Target (1 din se 2 hafte)**\n- Short-term traders use karte hain\n- Basis: sirf charts – support, resistance, breakout\n\n**2. Swing Target (1-3 mahine)**\n- Chart + short-term news\n- Result season, budget, policy change\n\n**3. Medium-Term Target (6-18 months)**\n- Brokerage reports\n- Future earnings (EPS estimate)\n\n**4. Long-Term Target (3-5+ saal)**\n- CAGR important hota hai\n\n## Formula\n**Target Price = Future Expected EPS × Fair PE**\n\n### Example:\n- Current Price: ₹700\n- Expected EPS 2 years baad: ₹50\n- Fair PE: 22\n- **Target Price = 50 × 22 = ₹1100**",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2025-12-05 10:00:00"
  },
  {
    wp_id: 3876,
    title: "Brightcom Group Share Price Target 2026, 2027, 2030 & 2040 – Analysis",
    slug: "brightcom-group-share-price-target-2026",
    excerpt: "Brightcom Group ke share price target ka detailed analysis. 2026 se 2040 tak ka realistic projection aur investment ke liye key factors.",
    content: "Brightcom Group Share Price Target Analysis\n\nBrightcom Group Limited (BCG) ek Indian digital advertising technology company hai. Company ka focus programmatic advertising aur digital media solutions par hai.\n\n## Key Financials\n- Market Cap: Mid-cap category\n- Sector: Digital Advertising / AdTech\n- Listed: BSE & NSE\n\n## Share Price Targets\n\n| Year | Bear Case | Base Case | Bull Case |\n|------|-----------|-----------|----------|\n| 2026 | ₹8-10 | ₹12-18 | ₹20-25 |\n| 2027 | ₹10-15 | ₹18-25 | ₹28-35 |\n| 2030 | ₹20-30 | ₹35-55 | ₹60-80 |\n| 2040 | ₹50-80 | ₹100-150 | ₹200+ |\n\n## Risk Factors\n- Regulatory compliance issues\n- Accounting irregularities in past\n- High competition in AdTech space\n\n## Conclusion\nBrightcom is a high-risk, high-reward stock. Invest only what you can afford to lose.",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2025-12-06 10:00:00"
  },
  {
    wp_id: 3939,
    title: "IRFC Share Price Target 2027-2050 Detailed Analysis",
    slug: "irfc-share-price-target-2027-2050",
    excerpt: "Indian Railway Finance Corporation (IRFC) ke share price target 2027 se 2050 tak ka comprehensive analysis. Railway sector ki growth story.",
    content: "IRFC Share Price Target Analysis 2027-2050\n\nIndian Railway Finance Corporation (IRFC) bharat ki railway infrastructure financing ki backbone hai. Yeh company Railway Ministry ki financial arm hai.\n\n## Business Model\n- IRFC borrows money from markets at low rates\n- Lends to Indian Railways for rolling stock acquisition\n- Guaranteed spread margin of ~0.5% (risk-free business)\n\n## Key Strengths\n- Government-backed NBFC (AAA rated)\n- Zero NPA model\n- Consistent dividend payer\n- Railways expansion = IRFC growth\n\n## Share Price Targets\n\n| Year | Conservative | Moderate | Optimistic |\n|------|-------------|---------|----------|\n| 2027 | ₹180-200 | ₹220-250 | ₹270-300 |\n| 2030 | ₹280-320 | ₹360-420 | ₹500-600 |\n| 2040 | ₹600-800 | ₹900-1200 | ₹1500+ |\n| 2050 | ₹1000-1500 | ₹2000-3000 | ₹4000+ |\n\n## Why IRFC for Long Term?\n- India's railway expansion plan worth ₹2.4 lakh crore\n- Dedicated Freight Corridors coming online\n- Bullet train project financing\n- Metro rail expansion across India",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2025-12-15 10:00:00"
  },
  {
    wp_id: 4024,
    title: "RVNL Share Price Target 2026, 2030, 2040 & 2050: Long Term Investor Guide",
    slug: "rvnl-share-price-target-2026-2030-2040",
    excerpt: "Rail Vikas Nigam Limited (RVNL) share price target analysis. Government PSU with massive railway infrastructure pipeline.",
    content: "RVNL Share Price Target - Long Term Analysis\n\nRail Vikas Nigam Limited (RVNL) is a Navratna PSU under Ministry of Railways. Company executes rail infrastructure projects.\n\n## Business Overview\n- Project execution for Indian Railways\n- New line construction, gauge conversion\n- Railway electrification projects\n- Metro rail projects\n\n## Order Book Strength\n- Current order book: ₹85,000+ crore\n- L1 position in multiple tenders\n- Growing international presence\n\n## Financial Highlights\n- Revenue growth: 15-20% CAGR\n- EBITDA margins: 7-9%\n- Debt-light model (client-funded)\n- Consistent dividend payment\n\n## Price Targets\n\n| Year | Low | Mid | High |\n|------|-----|-----|------|\n| 2026 | ₹380 | ₹450 | ₹550 |\n| 2030 | ₹700 | ₹950 | ₹1300 |\n| 2040 | ₹2000 | ₹3500 | ₹5000 |\n| 2050 | ₹5000 | ₹9000 | ₹15000 |\n\n## Conclusion\nRVNL is a strong government-backed infrastructure play with massive order visibility.",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2026-01-20 10:00:00"
  },
  {
    wp_id: 4040,
    title: "Suzlon Share Price Target 2026-2050: 6.2 GW Order Book Analysis",
    slug: "suzlon-share-price-target-2026-2027-2030",
    excerpt: "Suzlon Energy ke share price target ka comprehensive analysis. 6.2 GW order book aur 538% profit growth ke saath 2026 se 2050 tak ka outlook.",
    content: "Suzlon Share Price Target 2026-2050\n\nSuzlon Energy India ki sabse badi integrated wind energy company hai. 1995 mein sthaapit, yeh company wind turbine manufacturing se lekar O&M tak ka poora ecosystem sambhalti hai.\n\n## Key Highlights (2026)\n- **Order Book: 6.2 GW** (India ki sabse badi)\n- **Q2 FY26 PAT Growth: +538%**\n- **Net Debt Free**\n- **FII Holding: 23.73%**\n\n## Business Segments\n1. Wind Turbine Manufacturing (2.1 MW - 3.15 MW)\n2. EPC (Engineering, Procurement, Construction)\n3. O&M Services (recurring revenue)\n4. Wind Farm Development\n\n## Price Targets\n\n| Year | Bear | Base | Bull |\n|------|------|------|------|\n| 2026 | ₹50-65 | ₹65-85 | ₹80-95 |\n| 2027 | ₹85-100 | ₹100-125 | ₹125-150 |\n| 2030 | ₹140-180 | ₹200-270 | ₹300-400 |\n| 2035 | ₹300-450 | ₹500-700 | ₹800+ |\n| 2050 | ₹2000+ | ₹3000+ | ₹4000+ |\n\n## Why Bullish on Suzlon?\n- India's 500 GW renewable energy target by 2030\n- Wind energy to contribute 140-150 GW\n- Company has unmatched scale in India\n- Government PLI scheme support",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2026-02-02 10:00:00"
  },
  {
    wp_id: 4045,
    title: "Vodafone Idea Share Price Target 2026-2050",
    slug: "vodafone-idea-share-price-target-2026-to",
    excerpt: "Vodafone Idea (Vi) share price target analysis. Q3 mein loss ghata, ARPU badha - kya yeh turnaround stock hai?",
    content: "Vodafone Idea Share Price Target Analysis\n\nVodafone Idea (Vi) India ki teen badi telecom companies mein se ek hai. Company abhi financial restructuring phase mein hai.\n\n## Current Situation\n- Government equity conversion (33% stake)\n- AGR dues partially resolved\n- 5G launch pending capital requirements\n- ARPU improvement trend positive\n\n## Key Metrics Q3 FY26\n- Net Loss: Reducing trend\n- ARPU: ₹166+ (improving)\n- Subscriber base: Stabilizing\n- 4G network expansion ongoing\n\n## Price Targets\n\n| Scenario | 2026 | 2027 | 2030 |\n|----------|------|------|------|\n| Bull | ₹25-30 | ₹35-45 | ₹80-100 |\n| Base | ₹15-22 | ₹22-30 | ₹45-65 |\n| Bear | ₹8-12 | ₹10-15 | ₹20-30 |\n\n## High Risk Warning\nVodafone Idea is a very high risk stock. Company survival depends on:\n- Successful fundraising (₹25,000 crore needed)\n- Government support continuation\n- 5G spectrum payment schedule\n\n**Invest only what you can afford to lose completely.**",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2026-02-05 10:00:00"
  },
  {
    wp_id: 4067,
    title: "HDFC Bank vs ICICI Bank: 2026 mein Kaun Banega Multibagger?",
    slug: "hdfc-bank-vs-icici-bank-analysis-2026",
    excerpt: "HDFC Bank aur ICICI Bank ka head-to-head comparison. 2026 mein kaun sa banking stock better return dega? Data-based analysis.",
    content: "HDFC Bank vs ICICI Bank - 2026 Analysis\n\nIndia ke do sabse bade private sector banks ka detailed comparison.\n\n## Comparison Table\n\n| Parameter | HDFC Bank | ICICI Bank |\n|-----------|-----------|------------|\n| Market Cap | ₹12+ lakh crore | ₹8+ lakh crore |\n| ROE | 16-17% | 17-18% |\n| NIM | 3.4-3.6% | 4.2-4.4% |\n| GNPA | 1.3% | 2.2% |\n| Loan Growth | 10-12% | 15-18% |\n| Dividend Yield | 1.2% | 0.8% |\n\n## HDFC Bank\n**Strengths:**\n- Largest private bank by assets\n- Consistent quality\n- Strong retail franchise\n- Post-HDFC merger integration\n\n**Concerns:**\n- Slower loan growth post-merger\n- Margin pressure\n\n## ICICI Bank\n**Strengths:**\n- Faster growth trajectory\n- Better margins\n- Strong digital banking\n- Improving asset quality\n\n**Concerns:**\n- Higher risk appetite historically\n\n## 2026 Targets\n- **HDFC Bank:** ₹1900-2200\n- **ICICI Bank:** ₹1400-1700\n\n## Verdict\nFor long-term (5+ years): HDFC Bank for stability\nFor medium-term (2-3 years): ICICI Bank for growth\nFor portfolio: Hold both!",
    featured_image: null,
    category: "Stock Analysis",
    post_type: "post",
    published_at: "2026-02-10 10:00:00"
  }
];

async function importPosts() {
  console.log('🚀 Starting import to Supabase...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const post of posts) {
    const { data, error } = await supabase
      .from('posts')
      .upsert(post, { onConflict: 'wp_id' })
      .select();
    
    if (error) {
      console.error(`❌ Failed: ${post.title.substring(0, 50)}`);
      console.error(`   Error: ${error.message}`);
      failed++;
    } else {
      console.log(`✅ Imported: ${post.title.substring(0, 60)}`);
      success++;
    }
  }
  
  console.log(`\n📊 Import Complete!`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${posts.length}`);
}

importPosts().catch(console.error);
