'use client'

export default function FAQSection({ faq }: { faq: Array<{ q: string; a: string }> }) {
  if (!faq || faq.length === 0) return null
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div itemScope itemType="https://schema.org/FAQPage" className="space-y-4">
        {faq.map((item, idx) => (
          <div key={idx} itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="border-b pb-3">
            <h3 itemProp="name" className="font-semibold">{item.q}</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <div itemProp="text" className="text-gray-600 mt-1">{item.a}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
