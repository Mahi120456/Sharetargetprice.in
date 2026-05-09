import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Financial Calculators | ShareTargetPrice.in',
  description: 'Free financial calculators – SIP, EMI, CAGR, PPF, FD, RD, loan, and more for Indian investors.',
};

async function getAllCalculators() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('posts')
    .select('slug, title, excerpt')
    .eq('category', 'Calculator')
    .order('title', { ascending: true });
  return data || [];
}

export default async function CalculatorsIndexPage() {
  const calculators = await getAllCalculators();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
          Financial Calculators
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Free, easy-to-use calculators for SIP, EMI, loans, retirement planning, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {calculators.map((calc) => (
          <Link
            key={calc.slug}
            href={`/calculator/${calc.slug}`}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-orange-200 transition group"
          >
            <div className="font-semibold text-slate-800 group-hover:text-orange-600">
              {calc.title}
            </div>
            {calc.excerpt && (
              <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                {calc.excerpt}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
