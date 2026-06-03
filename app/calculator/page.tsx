import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial Calculators | SIP, Lumpsum, EMI, Tax, Retirement | Share Target Price',
  description: 'Free online calculators for SIP, lumpsum, EMI, tax, retirement, NRI, and more. Plan your finances with India-specific tools.',
};

async function getCalculators() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calculators')
    .select('slug, title, description, category, type')
    .order('title', { ascending: true });
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

  // Group by category
  const grouped = calculators.reduce((acc, calc) => {
    const cat = calc.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(calc);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Financial Calculators</h1>
        <p className="text-gray-600 text-lg mb-8">Free online calculators for SIP, lumpsum, EMI, tax, retirement & more – tailored for Indian investors.</p>
        
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3 capitalize">{category} Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((calc) => (
                <Link key={calc.slug} href={`/calculator/${calc.slug}`} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition hover:-translate-y-1 block">
                  <h3 className="text-lg font-bold text-gray-800">{calc.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{calc.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
