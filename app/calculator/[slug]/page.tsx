// app/calculator/[slug]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthorCard from '@/components/AuthorCard';
import { getAuthorBySlug } from '@/data/authors';
import CalculatorGrowUI from '@/components/CalculatorGrowUI'; // NAYA COMPONENT

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

export default async function CalculatorPage({ params }: { params: { slug: string } }) {
  const calc = await getCalculator(params.slug);
  if (!calc) notFound();

  const author = getAuthorBySlug('mahendra-maurya');

  // Schema for WebApplication (same as before)
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": calc.title,
    "description": calc.meta_description,
    "url": `https://sharetargetprice.in/calculator/${calc.slug}`,
    "applicationCategory": "Financial",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link href="/calculator" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> All Calculators
          </Link>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{calc.title}</h1>
            {calc.intro_paragraph && <p className="text-gray-700 mt-3 text-lg">{calc.intro_paragraph}</p>}
          </div>

          {/* ✅ NEW: Groww-style Calculator Component (handles inputs, calculate, results, what-is, how-to, formula, benefits, pro-tips, FAQ, chart) */}
          <CalculatorGrowUI calculator={calc} />

          {/* Related Calculators */}
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
