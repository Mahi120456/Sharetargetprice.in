import { supabase } from '@/lib/supabase';

export default async function AIFAQ({ slug }: { slug: string }) {
  const { data, error } = await supabase
    .from('comparison_ai_content')
    .select('faq')
    .eq('slug', slug)
    .single();

  if (error || !data?.faq) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 my-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 border-l-4 border-orange-500 pl-3">❓ Frequently Asked Questions (Comparison)</h2>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.faq }} />
    </div>
  );
}
