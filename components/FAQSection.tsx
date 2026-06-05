'use client'

function safeArray(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function FAQSection({ faq }: { faq: any }) {
  const items = safeArray(faq)
  if (items.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div itemScope itemType="https://schema.org/FAQPage" className="space-y-4">
        {items.map((item: any, idx: number) => (
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
