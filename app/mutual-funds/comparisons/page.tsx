import { supabase } from '@/lib/supabase';
import ComparisonsClient from '@/components/mutual-fund/ComparisonsClient';
import { getShortSlugFromName } from '@/lib/shortSlug';

export const revalidate = 3600;

async function getAllComparisons() {
  const { data: funds } = await supabase.from('mutual_funds').select('*');
  const fundMap = new Map();
  funds?.forEach(f => {
    const short = getShortSlugFromName(f.scheme_name);
    fundMap.set(short, f);
  });

  const { data: comparisons, error } = await supabase
    .from('comparison_ai_content')
    .select('slug')
    .order('slug', { ascending: true });

  if (error || !comparisons) return [];

  const enriched = comparisons
    .map(c => {
      const [slug1, slug2] = c.slug.split('-vs-');
      const fund1 = fundMap.get(slug1);
      const fund2 = fundMap.get(slug2);
      // Extra safety: ensure both parts exist
      if (fund1 && fund2 && slug1 && slug2) {
        return { slug: c.slug, fund1, fund2 };
      }
      return null;
    })
    .filter(Boolean);
  return enriched;
}

export default async function ComparisonsPage() {
  const comparisons = await getAllComparisons();
  return <ComparisonsClient initialComparisons={comparisons} />;
}
