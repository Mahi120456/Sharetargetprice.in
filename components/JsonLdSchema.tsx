export default function JsonLdSchema({ calculator }: { calculator: any }) {
  const schemas = []

  if (calculator.faq?.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: calculator.faq.map((item: { q: string; a: string }) => ({
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
