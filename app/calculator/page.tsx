// app/calculator/page.tsx
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import CalculatorListClient from '@/components/CalculatorListClient';

export const metadata: Metadata = {
  title: 'Financial Calculators | SIP, Lumpsum, EMI, Tax, Retirement | Share Target Price',
  description: 'Free online calculators for SIP, lumpsum, EMI, tax, retirement, NRI, and more. Plan your finances with India-specific tools.',
};

async function getCalculators() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calculators')
    .select('slug, title, description, category, calculator_group, seo_score, ranking_priority, focus_keyword')
    .order('ranking_priority', { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export default async function CalculatorsPage() {
  const calculators = await getCalculators();
  if (!calculators || calculators.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Financial Calculators</h1>
        <p className="text-gray-600 text-lg">No calculators found. Please check back later.</p>
      </div>
    );
  }

  const groups = [...new Set(calculators.map(c => c.calculator_group).filter(Boolean))];
  const categories = [...new Set(calculators.map(c => c.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Financial Calculators</h1>
        <p className="text-gray-600 text-lg mb-8">
          Free online calculators for SIP, lumpsum, EMI, tax, retirement & more – tailored for Indian investors.
        </p>

        {/* Client component for interactive filters */}
        <CalculatorListClient calculators={calculators} groups={groups} categories={categories} />
      </div>
    </div>
  );
}
