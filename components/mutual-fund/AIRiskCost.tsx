import { supabase } from '@/lib/supabase';

export default async function AIRiskCost({ slug }: { slug: string }) {
  const { data, error } = await supabase
    .from('comparison_ai_content')
    .select('risk_cost')
    .eq('slug', slug)
    .single();

  if (error || !data?.risk_cost) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm my-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2 border-l-4 border-orange-500 pl-3">⚠️ Risk & Cost Analysis</h2>
      <p className="text-gray-700 leading-relaxed">{data.risk_cost}</p>
    </div>
  );
}
