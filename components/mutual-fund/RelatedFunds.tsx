import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

interface RelatedFundsProps {
  fund: {
    category: string;
    fund_house: string;
    scheme_code: string;
  };
}

export default async function RelatedFunds({ fund }: RelatedFundsProps) {
  const supabase = createClient();
  const { data } = await supabase
    .from('mutual_funds')
    .select('scheme_name, slug')
    .eq('category', fund.category)
    .neq('scheme_code', fund.scheme_code)
    .limit(5);

  if (!data?.length) return null;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Related Funds in {fund.category}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((f) => (
          <Link
            key={f.slug}
            href={`/mutual-funds/${f.slug}`}
            className="block p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white"
          >
            {f.scheme_name}
          </Link>
        ))}
      </div>
    </div>
  );
}
