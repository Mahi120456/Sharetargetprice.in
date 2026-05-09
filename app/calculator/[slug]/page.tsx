import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: { slug: string };
};

async function getCalculator(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('category', 'Calculator')  // sirf calculator wale posts
    .single();
  
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const calculator = await getCalculator(params.slug);
  if (!calculator) return { title: 'Calculator Not Found' };
  return {
    title: `${calculator.title} | ShareTargetPrice.in`,
    description: calculator.excerpt || `Use our ${calculator.title} tool for accurate calculations.`,
  };
}

// Simple HTML formatter for calculator content
function formatCalculatorContent(content: string) {
  if (!content) return '';
  // WordPress style content ko safe HTML mein convert
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove any script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ''); // remove iframes for safety
}

export default async function CalculatorPage({ params }: Props) {
  const calculator = await getCalculator(params.slug);
  if (!calculator) notFound();

  const formattedContent = formatCalculatorContent(calculator.content || '');
  const publishDate = new Date(calculator.published_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/category/calculator" className="hover:text-orange-500">Calculators</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">{calculator.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
            🧮 Calculator
          </span>
          <span className="text-xs text-gray-400">📅 Updated: {publishDate}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
          {calculator.title}
        </h1>
        {calculator.excerpt && (
          <p className="text-gray-600 mt-4 text-lg border-l-4 border-orange-400 pl-4 bg-orange-50 py-3 rounded-r-lg">
            {calculator.excerpt}
          </p>
        )}
      </div>

      {/* Calculator Content (HTML/JS) */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        {formattedContent ? (
          <div 
            className="calculator-content"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">⚠️ Calculator content not available.</p>
            <p className="text-sm mt-2">Please check back later.</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        ⚠️ <strong>Disclaimer:</strong> This calculator is for educational purposes only. 
        Actual results may vary. Please consult a financial advisor before making investment decisions.
      </div>
    </div>
  );
}
