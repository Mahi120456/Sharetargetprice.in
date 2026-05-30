import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Mutual Fund Categories – Complete List | Share Target Price',
  description: 'Browse mutual funds by category – Large Cap, Mid Cap, Small Cap, ELSS, Hybrid, Multi Cap, Flexi Cap, and more. Find the best funds in each category.',
  keywords: 'mutual fund categories, large cap funds, mid cap funds, small cap funds, ELSS funds, hybrid funds, multi cap funds',
};

export default async function CategoriesListPage() {
  const { data: categoriesData, error } = await supabase
    .from('mutual_funds')
    .select('category')
    .not('category', 'is', null)
    .order('category', { ascending: true });

  if (error || !categoriesData) {
    return <div className="text-center py-20">Error loading categories. Please try again later.</div>;
  }

  // ✅ Fix: use Array.from instead of spread
  const uniqueCategories = Array.from(new Set(categoriesData.map(item => item.category)));
  const sortedCategories = uniqueCategories.sort();

  const getSlug = (category: string) => category.toLowerCase().replace(/ /g, '-');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all funds
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm mb-4">
            <Tag className="w-4 h-4" />
            Fund Categories
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            All Mutual Fund Categories
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse mutual funds by category. Explore funds by investment style, market cap, and asset allocation.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">📁 {sortedCategories.length} Categories</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedCategories.map((category) => (
            <Link
              key={category}
              href={`/mutual-funds/category/${getSlug(category)}`}
              className="group bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex items-center justify-between"
            >
              <span className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                {category}
              </span>
              <span className="text-orange-500 text-lg">→</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance does not guarantee future returns. Please read scheme documents carefully.
        </div>
      </div>
    </div>
  );
}
