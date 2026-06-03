import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Lightbulb, ThumbsUp } from 'lucide-react';
import AuthorCard from '@/components/AuthorCard';
import { getAuthorBySlug } from '@/data/authors';

// Generate static paths from database
export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase.from('calculators').select('slug');
  if (!data) return [];
  return data.map((calc) => ({ slug: calc.slug }));
}

async function getCalculator(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calculators')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const calc = await getCalculator(params.slug);
  if (!calc) return { title: 'Calculator Not Found' };
  return {
    title: calc.meta_title || calc.title,
    description: calc.meta_description || calc.description,
    keywords: calc.focus_keyword,
    alternates: { canonical: calc.canonical_url || `https://sharetargetprice.in/calculator/${calc.slug}` },
  };
}

function FAQSection({ faqJson }: { faqJson?: string }) {
  if (!faqJson) return null;
  let faqItems;
  try {
    faqItems = JSON.parse(faqJson);
  } catch {
    return null;
  }
  if (!Array.isArray(faqItems)) return null;
  return (
    <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <div itemScope itemType="https://schema.org/FAQPage">
        {faqItems.map((item, idx) => (
          <div key={idx} itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="mb-4 border-b pb-3">
            <h3 itemProp="name" className="font-semibold text-gray-800">{item.q}</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <div itemProp="text" className="text-gray-600 mt-1">{item.a}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RichTextBlock({ html, title, icon }: { html?: string; title?: string; icon?: React.ReactNode }) {
  if (!html) return null;
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border mt-6">
      {title && <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">{icon}{title}</h2>}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default async function CalculatorPage({ params }: { params: { slug: string } }) {
  const calc = await getCalculator(params.slug);
  if (!calc) notFound();

  const author = getAuthorBySlug('mahendra-maurya');

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": calc.title,
    "description": calc.meta_description,
    "url": `https://sharetargetprice.in/calculator/${calc.slug}`,
    "applicationCategory": "Financial",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "author": { "@type": "Person", "name": "Share Target Price Team" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link href="/calculator" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> All Calculators
          </Link>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{calc.title}</h1>
            {calc.intro_paragraph && <p className="text-gray-700 mt-3 text-lg">{calc.intro_paragraph}</p>}
          </div>

          {calc.what_is && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-2xl font-bold mb-2">What is {calc.title}?</h2>
              <p className="text-gray-700">{calc.what_is}</p>
            </div>
          )}

          {calc.how_to_use && <RichTextBlock html={calc.how_to_use} title="How to Use" icon={<CheckCircle className="w-5 h-5 text-green-600" />} />}
          {calc.formula_explanation && <RichTextBlock html={calc.formula_explanation} title="Formula & Calculation" icon={<Lightbulb className="w-5 h-5 text-yellow-600" />} />}
          {calc.example_calculation && <RichTextBlock html={calc.example_calculation} title="Example Calculation" icon={<Lightbulb className="w-5 h-5 text-blue-600" />} />}
          {calc.benefits && <RichTextBlock html={calc.benefits} title="Key Benefits" icon={<ThumbsUp className="w-5 h-5 text-green-600" />} />}
          
          {calc.important_notes && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mt-6">
              <p className="text-amber-800 text-sm">{calc.important_notes}</p>
            </div>
          )}
          
          {calc.pro_tips && <RichTextBlock html={calc.pro_tips} title="Pro Tips for Better Results" icon={<Lightbulb className="w-5 h-5 text-orange-600" />} />}
          
          <FAQSection faqJson={calc.faq} />

          {calc.related_calculators && (
            <div className="mt-10 bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold mb-3">Related Calculators</h3>
              <div className="flex flex-wrap gap-3">
                {calc.related_calculators.split(',').map((slug: string) => (
                  <Link key={slug} href={`/calculator/${slug.trim()}`} className="bg-gray-100 px-3 py-1.5 rounded-full text-sm hover:bg-orange-100 transition">
                    {slug.trim().replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {author && <AuthorCard author={author} />}

          <div className="flex flex-wrap justify-between items-center text-xs text-gray-400 text-center mt-8 border-t pt-4">
            <span>Last updated: {calc.last_updated ? new Date(calc.last_updated).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</span>
            {calc.seo_score && <span>SEO Score: {calc.seo_score}</span>}
            {calc.eeat_score && <span>EEAT Score: {calc.eeat_score}</span>}
          </div>
        </div>
      </div>
    </>
  );
}
