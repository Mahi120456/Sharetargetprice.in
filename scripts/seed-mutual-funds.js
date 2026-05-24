import { createClient } from '@supabase/supabase-js';
import { WebSocket } from 'ws';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Create Supabase client with WebSocket polyfill for Node.js
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: WebSocket,
    },
  }
);

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 90);
}

async function seedMutualFunds() {
  console.log('🚀 Fetching list of all schemes from MFapi.in...');
  const listRes = await fetch('https://api.mfapi.in/mf');
  const schemes = await listRes.json();
  console.log(`📊 Total schemes found: ${schemes.length}`);

  let allFunds = [];
  let inserted = 0;

  for (let i = 0; i < schemes.length; i++) {
    const scheme = schemes[i];
    try {
      const detailRes = await fetch(`https://api.mfapi.in/mf/${scheme.schemeCode}`);
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

      allFunds.push({
        scheme_code: scheme.schemeCode,
        scheme_name: scheme.schemeName,
        slug: generateSlug(scheme.schemeName),
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
      });

      if (allFunds.length >= 50) {
        const { error } = await supabase.from('mutual_funds').upsert(allFunds, { onConflict: 'scheme_code' });
        if (error) console.error('Batch error:', error);
        else inserted += allFunds.length;
        allFunds = [];
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (err) {
      console.error(`Error processing ${scheme.schemeCode}:`, err.message);
    }
  }

  if (allFunds.length > 0) {
    const { error } = await supabase.from('mutual_funds').upsert(allFunds, { onConflict: 'scheme_code' });
    if (!error) inserted += allFunds.length;
  }

  console.log(`✅ Seed completed. Inserted ${inserted} funds.`);
}

seedMutualFunds().catch(console.error);
