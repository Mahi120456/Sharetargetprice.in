import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export default async function CalculatorsListPage() {
  const filePath = path.join(process.cwd(), 'data/calculators', '_all_calculators.json');
  if (!fs.existsSync(filePath)) return <div>No calculators found</div>;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const calculators = data.calculators || data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">Financial Calculators</h1>
      <p className="text-gray-500 mb-10">239 free calculators for Indian investors</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calc: any) => (
          <Link key={calc.slug} href={`/calculator/${calc.slug}`} className="border rounded-lg p-4 hover:shadow-md hover:border-orange-300 transition">
            <p className="font-medium">{calc.title}</p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{calc.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
