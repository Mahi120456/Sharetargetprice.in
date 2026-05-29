import { supabase } from '@/lib/supabase';

export default async function AIVerdict({ slug }: { slug: string }) {
  const { data, error } = await supabase
    .from('comparison_ai_content')
    .select('verdict')
    .eq('slug', slug)
    .single();

  if (error || !data?.verdict) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 p-5 my-6">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">🤖 AI Verdict – Which is Better?</h2>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.verdict }} />
    </div>
  );
}
