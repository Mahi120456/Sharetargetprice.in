'use client'

import CalculatorEngine from './CalculatorEngine'
import FAQSection from './FAQSection'
import JsonLdSchema from './JsonLdSchema'

// Convert any value to array safely
function safeArray(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      // fallback: split by comma
      return value.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}

export default function CalculatorPage({ calculator }: { calculator: any }) {
  const relatedCalculators = safeArray(calculator.related_calculators)
  const faqItems = safeArray(calculator.faq)

  return (
    <>
      <JsonLdSchema calculator={calculator} />
      <nav className="text-sm text-gray-500 mb-4">
        <ol className="flex gap-2">
          <li><a href="/">Home</a></li>
          <li>/</li>
          <li><a href="/calculators">Calculators</a></li>
          <li>/</li>
          <li aria-current="page">{calculator.breadcrumb_label}</li>
        </ol>
      </nav>
      <h1 className="text-3xl font-bold mb-2">{calculator.title}</h1>
      <p className="text-gray-600 mb-6">{calculator.intro_paragraph}</p>

      <CalculatorEngine
        inputFields={calculator.input_fields}
        outputFields={calculator.output_fields}
        engineCode={calculator.calculator_engine}
        chartConfig={calculator.chart_config}
        validationRules={calculator.validation_rules}
      />

      <section className="mt-10 space-y-6">
        <div><h2 className="text-xl font-semibold">What is {calculator.title}?</h2><p>{calculator.what_is}</p></div>
        <div><h2 className="text-xl font-semibold">How to use</h2><p>{calculator.how_to_use}</p></div>
        <div><h2 className="text-xl font-semibold">Formula</h2><p className="font-mono bg-gray-50 p-3 rounded text-sm">{calculator.formula_verified}</p><p className="mt-2 text-sm">Source: {calculator.formula_source}</p></div>
        <div><h2 className="text-xl font-semibold">Example</h2><p>{calculator.example_calculation}</p></div>
        {calculator.benefits && <div><h2 className="text-xl font-semibold">Benefits</h2><div dangerouslySetInnerHTML={{ __html: calculator.benefits }} /></div>}
        {calculator.pro_tips && <div className="bg-blue-50 p-4 rounded"><h2 className="text-xl font-semibold">Pro Tips</h2><p>{calculator.pro_tips}</p></div>}
        {calculator.important_notes && <div className="bg-yellow-50 p-4 rounded border border-yellow-200"><h2 className="text-xl font-semibold">⚠️ Important Notes</h2><p>{calculator.important_notes}</p></div>}
      </section>

      {faqItems.length > 0 && <FAQSection faq={faqItems} />}

      {relatedCalculators.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Related Calculators</h2>
          <div className="flex flex-wrap gap-2">
            {relatedCalculators.map((slug: string) => (
              <a key={slug} href={`/calculators/${slug}`} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm">
                {slug.replace(/-/g, ' ')}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
