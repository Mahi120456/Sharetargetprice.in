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
    .eq('category', 'Calculator')
    .single();
  
  if (error || !data) return null;
  return data;
}

async function getRelatedCalculators(currentSlug: string, limit = 4) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, featured_image')
    .eq('category', 'Calculator')
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const calculator = await getCalculator(params.slug);
  if (!calculator) return { title: 'Calculator Not Found' };
  return {
    title: `${calculator.title} | Free Financial Calculator | ShareTargetPrice.in`,
    description: calculator.excerpt || `Use our free ${calculator.title} tool for accurate financial calculations. Easy to use, instant results.`,
    keywords: `${calculator.title}, free calculator, financial calculator, Indian finance tool`,
    openGraph: {
      title: `${calculator.title} | Free Financial Calculator`,
      description: calculator.excerpt || `Calculate ${calculator.title} with our free online tool.`,
      type: 'website',
    },
  };
}

function formatCalculatorContent(content: string) {
  if (!content) return '';
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

export default async function CalculatorPage({ params }: Props) {
  const calculator = await getCalculator(params.slug);
  if (!calculator) notFound();

  const formattedContent = formatCalculatorContent(calculator.content || '');
  const publishDate = new Date(calculator.published_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const relatedCalculators = await getRelatedCalculators(params.slug, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-orange-500 transition">Home</Link>
          <span>›</span>
          <Link href="/category/calculator" className="hover:text-orange-500 transition">Calculators</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium line-clamp-1">{calculator.title}</span>
        </nav>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-50 to-white p-6 md:p-8 border-b border-orange-100">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <span>🧮</span> Calculator Tool
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span>📅</span> Updated: {publishDate}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              {calculator.title}
            </h1>
            {calculator.excerpt && (
              <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 pl-4 py-3 rounded-r-lg">
                <p className="text-gray-700">{calculator.excerpt}</p>
              </div>
            )}
          </div>
          
          {/* Quick Info Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 text-center text-sm">
            <div>
              <div className="text-gray-500 text-xs">Tool Type</div>
              <div className="font-semibold text-gray-800">Financial Calculator</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Category</div>
              <div className="font-semibold text-gray-800">Investment Tool</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Usage</div>
              <div className="font-semibold text-gray-800">Free & Unlimited</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Device</div>
              <div className="font-semibold text-gray-800">Mobile/Web</div>
            </div>
          </div>
        </div>

        {/* Calculator Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            {formattedContent ? (
              <div 
                className="calculator-content prose prose-slate max-w-none prose-headings:font-bold prose-a:text-orange-600"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-3">⚠️</div>
                <p className="text-lg font-medium">Calculator content not available.</p>
                <p className="text-sm mt-1">Please check back later.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Calculators Section */}
        {relatedCalculators.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>📚</span> Other Calculators You May Like
              </h2>
              <Link href="/category/calculator" className="text-orange-500 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedCalculators.map((calc) => (
                <Link
                  key={calc.id}
                  href={`/calculator/${calc.slug}`}
                  className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🧮</span>
                    <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Calculator</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition line-clamp-2 text-sm">
                    {calc.title}
                  </h3>
                  {calc.excerpt && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{calc.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-center text-white">
          <h3 className="text-lg font-bold mb-2">Need More Financial Tools?</h3>
          <p className="text-sm text-gray-300 mb-4">Explore our collection of 50+ calculators for SIP, EMI, CAGR, and more.</p>
          <Link href="/category/calculator" className="inline-block bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-full text-sm font-semibold transition">
            Browse All Calculators →
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          ⚠️ <strong>Disclaimer:</strong> This calculator is for educational purposes only. 
          Actual results may vary. Always consult a SEBI-registered financial advisor before making investment decisions.
        </div>
      </div>
    </div>
  );
}
