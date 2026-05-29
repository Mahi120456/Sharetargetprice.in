import { supabase } from '@/lib/supabase';

export default async function AIIntro({ slug }: { slug: string }) {
  const { data, error } = await supabase
    .from('comparison_ai_content')
    .select('intro')
    .eq('slug', slug)
    .single();

  if (error || !data?.intro) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.intro }} />
    </div>
  );
}
