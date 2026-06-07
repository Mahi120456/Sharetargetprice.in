import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CalculatorPage from '@/components/CalculatorPage'

export const revalidate = 86400 // ISR – revalidate every 24 hours
export const dynamicParams = true

async function getCalculator(slug: string) {
  const { data, error } = await supabase
    .from('calculators')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return data
}

export async function generateStaticParams() {
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
    openGraph: {
      title: calc.og_title || calc.meta_title,
      description: calc.og_description || calc.meta_description,
      url: calc.canonical_url,
      type: 'website',
      siteName: 'Share Target Price',
    },
    twitter: {
      card: 'summary_large_image',
      title: calc.og_title || calc.meta_title,
      description: calc.og_description || calc.meta_description,
    },
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const calc = await getCalculator(params.slug)
  if (!calc) notFound()
  return <CalculatorPage calculator={calc} />
}
