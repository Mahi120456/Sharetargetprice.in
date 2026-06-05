'use client'

import { useState } from 'react'
import CalculatorEngine from './CalculatorEngine'
import FAQSection from './FAQSection'
import JsonLdSchema from './JsonLdSchema'
import { ChevronDown, ChevronUp, Calculator, TrendingUp, Info, Lightbulb, CheckCircle, ThumbsUp, AlertCircle, BookOpen, Sparkles } from 'lucide-react'

// Safe array helper
function safeArray(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch { return [] }
  }
  return []
}

// Accordion Section Component
function AccordionSection({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon?: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-800 hover:bg-gray-50 transition"
      >
        <span className="flex items-center gap-2.5">
          {Icon && <Icon className="w-5 h-5 text-orange-500" />}
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-5 pt-0 border-t border-gray-100 prose prose-sm max-w-none text-gray-600">
          {children}
        </div>
      )}
    </div>
  )
}

export default function CalculatorPage({ calculator }: { calculator: any }) {
  const relatedCalculators = safeArray(calculator.related_calculators)
  const faqItems = safeArray(calculator.faq)

  // Check if any educational content exists
  const hasContent = calculator.what_is || calculator.how_to_use || calculator.formula_verified || calculator.benefits || calculator.pro_tips || calculator.important_notes

  return (
    <>
      <JsonLdSchema calculator={calculator} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <ol className="flex flex-wrap items-center gap-1">
              <li><a href="/" className="hover:text-orange-600 transition">Home</a></li>
              <li className="text-gray-400">/</li>
              <li><a href="/calculators" className="hover:text-orange-600 transition">Calculators</a></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700 font-medium truncate">{calculator.breadcrumb_label || calculator.title}</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 mb-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Financial Tool</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{calculator.title}</h1>
              {calculator.intro_paragraph && (
                <p className="text-gray-700 text-base md:text-lg max-w-3xl">{calculator.intro_paragraph}</p>
              )}
            </div>
          </div>

          {/* Main Calculator Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Calculate Now</h2>
              </div>
              <CalculatorEngine
                inputFields={calculator.input_fields}
                outputFields={calculator.output_fields}
                engineCode={calculator.calculator_engine}
                chartConfig={calculator.chart_config}
                validationRules={calculator.validation_rules}
              />
            </div>
          </div>

          {/* Educational Content - Accordion Sections */}
          {hasContent && (
            <div className="space-y-4 mb-8">
              {calculator.what_is && (
                <AccordionSection title={`What is ${calculator.title}?`} icon={Info}>
                  <p>{calculator.what_is}</p>
                </AccordionSection>
              )}
              {calculator.how_to_use && (
                <AccordionSection title="How to use this calculator" icon={Lightbulb}>
                  <div dangerouslySetInnerHTML={{ __html: calculator.how_to_use }} />
                </AccordionSection>
              )}
              {calculator.formula_verified && (
                <AccordionSection title="Formula & Calculation" icon={Calculator}>
                  <div>
                    <p className="font-mono bg-gray-100 p-3 rounded text-sm">{calculator.formula_verified}</p>
                    {calculator.formula_source && <p className="mt-2 text-sm text-gray-500">📖 Source: {calculator.formula_source}</p>}
                  </div>
                </AccordionSection>
              )}
              {calculator.example_calculation && (
                <AccordionSection title="Example Calculation" icon={BookOpen}>
                  <p>{calculator.example_calculation}</p>
                </AccordionSection>
              )}
              {calculator.benefits && (
                <AccordionSection title="Key Benefits" icon={CheckCircle}>
                  <div dangerouslySetInnerHTML={{ __html: calculator.benefits }} />
                </AccordionSection>
              )}
              {calculator.pro_tips && (
                <AccordionSection title="Pro Tips" icon={ThumbsUp}>
                  <div dangerouslySetInnerHTML={{ __html: calculator.pro_tips }} />
                </AccordionSection>
              )}
              {calculator.important_notes && (
                <AccordionSection title="Important Notes" icon={AlertCircle}>
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                    <p className="text-amber-800">{calculator.important_notes}</p>
                  </div>
                </AccordionSection>
              )}
            </div>
          )}

          {/* FAQ Section */}
          {faqItems.length > 0 && (
            <div className="mb-8">
              <FAQSection faq={faqItems} />
            </div>
          )}

          {/* Related Calculators */}
          {relatedCalculators.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Related Calculators
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedCalculators.map((slug: string) => (
                  <a
                    key={slug}
                    href={`/calculators/${slug}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-full text-sm transition-colors"
                  >
                    {slug.replace(/-/g, ' ')}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-8 text-center text-xs text-gray-400 border-t pt-6">
            Last updated: {calculator.last_updated ? new Date(calculator.last_updated).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
            {calculator.seo_score && <span className="mx-2">•</span>}
            {calculator.seo_score && <span>SEO Score: {calculator.seo_score}</span>}
            {calculator.eeat_score && <span className="mx-2">•</span>}
            {calculator.eeat_score && <span>EEAT Score: {calculator.eeat_score}</span>}
          </div>
        </div>
      </div>
    </>
  )
}
