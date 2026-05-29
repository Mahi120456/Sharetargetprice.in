import { supabase } from '@/lib/supabase';
import ComparisonsClient from '@/components/mutual-fund/ComparisonsClient';

export const revalidate = 3600;

// Helper to get short slug
function getShortSlugFromName(name: string): string {
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

async function getAllComparisons() {
  // Fetch all funds to build map
  const { data: funds } = await supabase.from('mutual_funds').select('*');
  const fundMap = new Map();
  funds?.forEach(f => {
    const short = getShortSlugFromName(f.scheme_name);
    fundMap.set(short, f);
  });

  // Fetch all comparison slugs
  const { data: comparisons, error } = await supabase
    .from('comparison_ai_content')
    .select('slug')
    .order('slug', { ascending: true });

  if (error || !comparisons) return [];

  // Enrich with fund details
  const enriched = comparisons
    .map(c => {
      const [slug1, slug2] = c.slug.split('-vs-');
      const fund1 = fundMap.get(slug1);
      const fund2 = fundMap.get(slug2);
      return fund1 && fund2 ? { slug: c.slug, fund1, fund2 } : null;
    })
    .filter(Boolean);
  return enriched;
}

export default async function ComparisonsPage() {
  const comparisons = await getAllComparisons();
  return <ComparisonsClient initialComparisons={comparisons} />;
}
