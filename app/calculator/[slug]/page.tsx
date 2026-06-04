import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { flattenCalculator } from '@/lib/calculatorUtils';
import { calculatorEngines } from '@/lib/calculatorEngines';
import CalculatorPro from '@/components/CalculatorPro';

// Build time: generate all static params
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'data/calculators', '_all_calculators.json');
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const calculators = data.calculators || data;
  return calculators.map((c: any) => ({ slug: c.slug }));
}

// Fetch one calculator by slug
async function getCalculator(slug: string) {
  const filePath = path.join(process.cwd(), 'data/calculators', '_all_calculators.json');
  if (!fs.existsSync(filePath)) return null;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const calculators = data.calculators || data;
  return calculators.find((c: any) => c.slug === slug) || null;
}

export default async function CalculatorPage({ params }: { params: { slug: string } }) {
  const raw = await getCalculator(params.slug);
  if (!raw) notFound();

  const calculator = flattenCalculator(raw);
  const engine = calculatorEngines[params.slug];
  if (!engine) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <a href="/calculator" className="text-sm text-gray-500 hover:text-orange-600">← All Calculators</a>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 my-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{calculator.title}</h1>
          {calculator.intro_paragraph && <p className="text-gray-700 mt-3 text-lg">{calculator.intro_paragraph}</p>}
        </div>
        <CalculatorPro calculator={calculator} engine={engine} />
      </div>
    </div>
  );
}
