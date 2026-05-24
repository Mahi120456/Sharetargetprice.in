// scripts/seed-mutual-funds.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // Use service role key for inserts
);

// Generate URL-friendly slug from scheme name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 90);
}

// Map category from MFapi meta
function mapCategory(metaCategory) {
  if (!metaCategory) return 'Others';
  const cat = metaCategory.toLowerCase();
  if (cat.includes('large cap')) return 'Large Cap';
  if (cat.includes('mid cap')) return 'Mid Cap';
  if (cat.includes('small cap')) return 'Small Cap';
  if (cat.includes('elss')) return 'ELSS';
  if (cat.includes('liquid')) return 'Liquid';
  if (cat.includes('ultra short')) return 'Ultra Short Duration';
  if (cat.includes('gilt')) return 'Gilt';
  if (cat.includes('corporate bond')) return 'Corporate Bond';
  if (cat.includes('hybrid')) return 'Hybrid';
  if (cat.includes('balanced')) return 'Balanced';
  if (cat.includes('etf')) return 'ETF';
  if (cat.includes('index')) return 'Index Fund';
  if (cat.includes('silver')) return 'Silver';
  if (cat.includes('gold')) return 'Gold';
  if (cat.includes('commodities')) return 'Commodities';
  return metaCategory;
}

// Map riskometer
function mapRisk(risk) {
  if (!risk) return 'Moderate';
  const r = risk.toLowerCase();
  if (r.includes('low')) return 'Low';
  if (r.includes('moderate')) return 'Moderate';
  if (r.includes('high')) return 'High';
  if (r.includes('very high')) return 'Very High';
  return 'Moderate';
}

async function seedMutualFunds() {
  console.log('🚀 Fetching list of all schemes from MFapi.in...');
  
  // Step 1: Get all scheme codes
  const listRes = await fetch('https://api.mfapi.in/mf');
  const schemes = await listRes.json();
  console.log(`📊 Total schemes found: ${schemes.length}`);
  
  // We'll process in batches to avoid rate limits
  let allFunds = [];
  let counter = 0;
  
  for (const scheme of schemes) {
    counter++;
    try {
      // Fetch detailed data for each scheme
      const detailRes = await fetch(`https://api.mfapi.in/mf/${scheme.schemeCode}`);
      const detail = await detailRes.json();
      
      const latestNAV = detail.data?.[0]?.nav ? parseFloat(detail.data[0].nav) : null;
      const meta = detail.meta || {};
      
      // Calculate approximate returns (from historical data if available)
      let returns1y = null, returns3y = null;
      if (detail.data && detail.data.length > 0) {
        const currentNav = latestNAV;
        const findNavByDate = (yearsAgo) => {
          const targetDate = new Date();
          targetDate.setFullYear(targetDate.getFullYear() - yearsAgo);
          const targetStr = targetDate.toISOString().split('T')[0];
          const entry = detail.data.find(d => d.date === targetStr);
          return entry ? parseFloat(entry.nav) : null;
        };
        const nav1y = findNavByDate(1);
        const nav3y = findNavByDate(3);
        if (nav1y && currentNav) returns1y = ((currentNav - nav1y) / nav1y) * 100;
        if (nav3y && currentNav) returns3y = ((currentNav - nav3y) / nav3y) * 100;
      }
      
      const fund = {
        scheme_code: scheme.schemeCode,
        scheme_name: scheme.schemeName,
        slug: generateSlug(scheme.schemeName),
        fund_house: meta.fund_house || null,
        category: mapCategory(meta.scheme_category),
        sub_category: meta.scheme_category || null,
        nav: latestNAV,
        aum: null,  // Not available from free API
        expense_ratio: null,
        min_sip_amount: 500,  // default, can be updated
        min_lumpsum: 1000,
        returns_1y: returns1y,
        returns_3y: returns3y,
        returns_5y: null,
        riskometer: mapRisk(meta.riskometer),
        benchmark: meta.benchmark || null,
        fund_manager: null,
        launch_date: meta.launch_date ? new Date(meta.launch_date) : null,
        content: null,  // Will generate later with AI
        excerpt: null,
        seo_title: null,
        seo_description: null,
      };
      
      allFunds.push(fund);
      
      // Insert in batches of 50
      if (allFunds.length >= 50) {
        const { error } = await supabase.from('mutual_funds').upsert(allFunds, { onConflict: 'scheme_code' });
        if (error) console.error('Batch insert error:', error);
        else console.log(`✅ Inserted ${counter}/${schemes.length} funds`);
        allFunds = [];
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
      }
    } catch (err) {
      console.error(`Error processing ${scheme.schemeCode}:`, err.message);
    }
  }
  
  // Insert remaining
  if (allFunds.length > 0) {
    const { error } = await supabase.from('mutual_funds').upsert(allFunds, { onConflict: 'scheme_code' });
    if (error) console.error('Final batch insert error:', error);
    else console.log(`✅ Final batch inserted: ${allFunds.length} funds`);
  }
  
  console.log('🎉 Mutual funds seeding complete!');
}

seedMutualFunds().catch(console.error);
