import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CalculatorPage from '@/components/CalculatorPage'

async function getCalculator(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('calculators')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return data
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase.from('calculators').select('slug')
  return (data ?? []).map((row) => ({ slug: row.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const calc = await getCalculator(params.slug)
  if (!calc) return { title: 'Calculator Not Found' }
  return {
    title: calc.meta_title,
    description: calc.meta_description,
    alternates: { canonical: calc.canonical_url },
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const calc = await getCalculator(params.slug)
  if (!calc) notFound()
  return <CalculatorPage calculator={calc} />
}
