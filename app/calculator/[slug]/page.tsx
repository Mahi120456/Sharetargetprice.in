import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import CalculatorPro from '@/components/CalculatorPro';

function getNested(obj: any, pathStr: string) {
  return pathStr.split('.').reduce((o, k) => o?.[k], obj);
}

function flattenCalculator(raw: any) {
  return {
    slug: raw.slug,
    title: raw.title,
    category: raw.category,
    type: raw.type,
    description: raw.description,
    meta_title: getNested(raw, '_seo.meta_title') || raw.title,
    meta_description: getNested(raw, '_seo.meta_description') || '',
    canonical_url: getNested(raw, '_seo.canonical_url') || `https://sharetargetprice.in/calculator/${raw.slug}`,
    intro_paragraph: getNested(raw, '_content.intro_paragraph') || '',
    what_is: getNested(raw, '_content.what_is') || '',
    how_to_use: getNested(raw, '_content.how_to_use') || '',
    formula_explanation: getNested(raw, '_formula.formula_explanation') || '',
    benefits: getNested(raw, '_content.benefits') || '',
    pro_tips: getNested(raw, '_content.pro_tips') || '',
    important_notes: getNested(raw, '_content.important_notes') || '',
    result_explanation: getNested(raw, '_content.result_explanation') || '',
    faq: getNested(raw, '_content.faq') || [],
    input_fields: getNested(raw, '_calculator.input_fields') || [],
    output_fields: getNested(raw, '_calculator.output_fields') || [],
    chart_config: getNested(raw, '_calculator.chart_config') || null,
    validation_rules: getNested(raw, '_calculator.validation_rules') || {},
    related_calculators: getNested(raw, '_links.related_calculators') || [],
  };
}

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'data/calculators', '_all_calculators.json');
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const calculators = data.calculators || data;
  return calculators.map((c: any) => ({ slug: c.slug }));
}

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <a href="/calculator" className="text-sm text-gray-500 hover:text-orange-600 inline-flex items-center gap-1 mb-4">
          ← All Calculators
        </a>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{calculator.title}</h1>
          {calculator.intro_paragraph && <p className="text-gray-700 mt-3 text-lg">{calculator.intro_paragraph}</p>}
        </div>
        {/* PASS ONLY SLUG, NOT THE FUNCTION */}
        <CalculatorPro calculator={calculator} slug={params.slug} />
      </div>
    </div>
  );
}
