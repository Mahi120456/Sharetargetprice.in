import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getShortSlugFromName } from '@/lib/shortSlug';

export default async function ComparisonLinks({ fund }: { fund: { category: string; scheme_name: string; slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('mutual_funds')
    .select('scheme_name, slug')
    .eq('category', fund.category)
    .neq('slug', fund.slug)
    .order('aum', { ascending: false })
    .limit(3);
  
  if (!data?.length) return null;

  const currentShortSlug = getShortSlugFromName(fund.scheme_name);
  
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Compare with Similar Funds</h2>
      <div className="flex flex-wrap gap-3">
        {data.map((f) => {
          const otherShortSlug = getShortSlugFromName(f.scheme_name);
          return (
            <Link
              key={f.slug}
              href={`/mutual-funds/compare/${currentShortSlug}-vs-${otherShortSlug}`}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
            >
              {fund.scheme_name} vs {f.scheme_name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
