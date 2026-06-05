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

export default function JsonLdSchema({ calculator }: { calculator: any }) {
  const schemas = []
  const faqItems = safeArray(calculator.faq)

  if (faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item: { q: string; a: string }) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
  }

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: calculator.title,
    description: calculator.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  })

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sharetargetprice.in' },
      { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://sharetargetprice.in/calculators' },
      { '@type': 'ListItem', position: 3, name: calculator.breadcrumb_label, item: calculator.canonical_url },
    ],
  })

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </>
  )
}
