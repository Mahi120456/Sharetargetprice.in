import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Financial Calculators | SIP, Lumpsum, EMI, Tax, Retirement | Share Target Price',
  description: 'Free online calculators for SIP, lumpsum, EMI, tax, retirement, NRI, and more. Plan your finances with India-specific tools.',
};

interface Calculator {
  slug: string;
  title: string;
  description: string;
  category: string;
  type: string;
}

async function getCalculators(): Promise<Calculator[]> {
  const calculators: Calculator[] = [];
  const filePath = path.join(process.cwd(), 'data', 'calculators_enhanced.csv');
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: '\t' }))   // tab-separated
      .on('data', (row) => {
        if (row.slug) {
          calculators.push({
            slug: row.slug,
            title: row.title,
            description: row.description || row.meta_description || '',
            category: row.category,
            type: row.type,
          });
        }
      })
      .on('end', () => resolve())
      .on('error', reject);
  });
  return calculators;
}

// Group calculators by category
function groupByCategory(calculators: Calculator[]) {
  const groups: Record<string, Calculator[]> = {};
  for (const calc of calculators) {
    const cat = calc.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(calc);
  }
  // sort groups alphabetically
  return Object.fromEntries(Object.entries(groups).sort());
}

export default async function CalculatorsPage() {
  const calculators = await getCalculators();
  const grouped = groupByCategory(calculators);

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
