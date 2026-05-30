import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getShortSlugFromName } from '@/lib/shortSlug';

// Cache existing comparison slugs to avoid repeated DB calls
let existingSlugsCache: Set<string> | null = null;

async function getExistingComparisonSlugs() {
  if (existingSlugsCache) return existingSlugsCache;
  const supabase = createClient();
  const { data } = await supabase.from('comparison_ai_content').select('slug');
  existingSlugsCache = new Set(data?.map(c => c.slug) || []);
  return existingSlugsCache;
}

export default async function ComparisonLinks({ fund }: { fund: { category: string; scheme_name: string; slug: string } }) {
  const supabase = createClient();
  const existingSlugs = await getExistingComparisonSlugs();

  // Fetch top 6 similar funds from same category (by AUM)
  const { data: similarFunds } = await supabase
    .from('mutual_funds')
    .select('scheme_name, slug')
    .eq('category', fund.category)
    .neq('slug', fund.slug)
    .order('aum', { ascending: false })
    .limit(6);

  if (!similarFunds?.length) return null;

  const currentShort = getShortSlugFromName(fund.scheme_name);
  const validLinks = [];

  for (const other of similarFunds) {
    const otherShort = getShortSlugFromName(other.scheme_name);
    const pairSlug = `${currentShort}-vs-${otherShort}`;
    if (existingSlugs.has(pairSlug)) {
      validLinks.push({ slug: pairSlug, name: other.scheme_name });
    }
    if (validLinks.length >= 3) break; // sirf 3 links dikhao
  }

  if (validLinks.length === 0) return null;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Compare with Similar Top Funds</h2>
      <div className="flex flex-wrap gap-3">
        {validLinks.map(link => (
          <Link
            key={link.slug}
            href={`/mutual-funds/compare/${link.slug}`}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
          >
            {fund.scheme_name} vs {link.name}
          </Link>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">* Comparisons among top funds by assets</p>
    </div>
  );
}
