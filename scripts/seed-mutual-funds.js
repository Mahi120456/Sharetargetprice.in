import { createClient } from '@supabase/supabase-js';
import { WebSocket } from 'ws';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: { transport: WebSocket },
  }
);

// Generate unique slug: name + scheme code
function generateSlug(name, code) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 70);
  return `${base}-${code}`;
}

async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function seedMutualFunds() {
  console.log('🚀 Fetching list of all schemes from MFapi.in...');
  const listRes = await fetchWithTimeout('https://api.mfapi.in/mf', 30000);
  const schemes = await listRes.json();
  console.log(`📊 Total schemes found: ${schemes.length}`);

  let allFunds = [];
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < schemes.length; i++) {
    const scheme = schemes[i];
    try {
      const detailRes = await fetchWithTimeout(`https://api.mfapi.in/mf/${scheme.schemeCode}`, 10000);
      const detail = await detailRes.json();
      const meta = detail.meta || {};
      const latestNAV = detail.data?.[0]?.nav ? parseFloat(detail.data[0].nav) : null;

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
        slug: generateSlug(scheme.schemeName, scheme.schemeCode),
        fund_house: meta.fund_house || null,
        category: meta.scheme_category || 'Others',
        nav: latestNAV,
        aum: null,
        expense_ratio: null,
        min_sip_amount: 500,
        min_lumpsum: 1000,
        returns_1y: returns1y,
        returns_3y: returns3y,
        returns_5y: null,
        riskometer: 'Moderate',
        benchmark: null,
        fund_manager: null,
        launch_date: meta.launch_date ? new Date(meta.launch_date) : null,
        content: null,
      };

      allFunds.push(fund);

      if (allFunds.length >= 50) {
        const { error } = await supabase.from('mutual_funds').upsert(allFunds, { onConflict: 'scheme_code' });
        if (error) {
          console.error('Batch error:', error.message);
          failed += allFunds.length;
        } else {
          inserted += allFunds.length;
          console.log(`✅ Inserted ${inserted} funds so far...`);
        }
        allFunds = [];
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (err) {
      console.error(`Error processing ${scheme.schemeCode}:`, err.message);
      failed++;
    }
  }

  // Insert remaining
  if (allFunds.length > 0) {
    const { error } = await supabase.from('mutual_funds').upsert(allFunds, { onConflict: 'scheme_code' });
    if (error) {
      console.error('Final batch error:', error.message);
      failed += allFunds.length;
    } else {
      inserted += allFunds.length;
    }
  }

  console.log(`✅ Seed completed. Inserted: ${inserted}, Failed: ${failed}`);
}

seedMutualFunds().catch(console.error);
