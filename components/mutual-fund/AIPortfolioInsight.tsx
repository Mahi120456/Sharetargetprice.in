import { supabase } from '@/lib/supabase';

export default async function AIPortfolioInsight({ slug }: { slug: string }) {
  const { data, error } = await supabase
    .from('comparison_ai_content')
    .select('portfolio_insight')
    .eq('slug', slug)
    .single();

  if (error || !data?.portfolio_insight) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 my-6 shadow-sm">
      <h2 className="text-xl font-bold mb-2 border-l-4 border-orange-500 pl-3">📊 Portfolio Diversification</h2>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.portfolio_insight }} />
    </div>
  );
}
