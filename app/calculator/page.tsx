import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Financial Calculators India — SIP, EMI, Tax, Retirement & More',
  description: 'Free online financial calculators for India — SIP, home loan EMI, income tax, PPF, NPS, FD, and 230+ more.',
}

const TYPE_LABELS: Record<string, string> = {
  investment: '📈 Investment',
  loan: '🏠 Loan & EMI',
  tax: '💰 Tax',
  retirement: '🧓 Retirement',
  trading: '📊 Trading',
  insurance: '🛡️ Insurance',
  nri: '✈️ NRI',
  property: '🏘️ Property',
  portfolio: '📂 Portfolio',
  options: '📉 Options',
  deposit: '🏦 Deposits',
}

export default async function CalculatorsListPage() {
  const supabase = createClient()
  const { data: calculators } = await supabase
    .from('calculators')
    .select('slug, title, type, description')
    .eq('category', 'individual')
    .order('ranking_priority', { ascending: true })

  const grouped: Record<string, typeof calculators> = {}
  for (const calc of calculators ?? []) {
    const t = calc.type ?? 'other'
    if (!grouped[t]) grouped[t] = []
    grouped[t]!.push(calc)
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">Financial Calculators</h1>
      <p className="text-gray-500 mb-10">237 free calculators for Indian investors.</p>
      {Object.entries(grouped).map(([type, calcs]) => (
        <section key={type} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{TYPE_LABELS[type] ?? type}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {calcs?.map((c) => (
              <Link key={c.slug} href={`/calculators/${c.slug}`} className="border rounded-lg p-4 hover:shadow-md hover:border-orange-400 transition">
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
