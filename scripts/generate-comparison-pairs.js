import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // use service role for fetching
);

function getShortSlug(name, existingSlugs) {
  let slug = name
    .toLowerCase()
    .replace(/ - direct plan( - growth)?/gi, '')
    .replace(/ - growth option/gi, '')
    .replace(/ fund/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (slug.length > 35) slug = slug.substring(0,35).replace(/-$/, '');
  // ensure uniqueness
  let final = slug;
  let counter = 1;
  while (existingSlugs.has(final)) {
    final = `${slug}-${counter++}`;
  }
  existingSlugs.add(final);
  return final;
}

async function generatePairs() {
  // Fetch top 100 funds by AUM
  const { data: funds, error } = await supabase
    .from('mutual_funds')
    .select('slug, scheme_name, aum')
    .not('aum', 'is', null)
    .order('aum', { ascending: false })
    .limit(100);
  
  if (error || !funds) {
    console.error('Error fetching funds:', error);
    return;
  }

  const existingSlugs = new Set();
  const fundsWithShort = funds.map(f => ({
    ...f,
    shortSlug: getShortSlug(f.scheme_name, existingSlugs)
  }));

  const pairs = [];
  for (let i = 0; i < fundsWithShort.length; i++) {
    for (let j = i+1; j < fundsWithShort.length; j++) {
      pairs.push({
        shortSlug: `${fundsWithShort[i].shortSlug}-vs-${fundsWithShort[j].shortSlug}`,
        slug1: fundsWithShort[i].slug,
        slug2: fundsWithShort[j].slug,
        name1: fundsWithShort[i].scheme_name,
        name2: fundsWithShort[j].scheme_name,
        shortName1: fundsWithShort[i].shortSlug.replace(/-/g, ' '),
        shortName2: fundsWithShort[j].shortSlug.replace(/-/g, ' ')
      });
    }
  }

  fs.writeFileSync('./comparison-pairs.json', JSON.stringify(pairs, null, 2));
  console.log(`✅ Generated ${pairs.length} comparison pairs (${fundsWithShort.length} funds)`);
}

generatePairs().catch(console.error);
