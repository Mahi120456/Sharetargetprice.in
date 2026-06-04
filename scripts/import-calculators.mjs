// scripts/import-calculators.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// CHANGE THIS PATH if your _all_calculators.json is elsewhere
const raw = readFileSync('./data/calculators/_all_calculators.json', 'utf-8')
const data = JSON.parse(raw)
const calculators = data.calculators || data

function getNested(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj)
}

function toRow(c) {
  return {
    slug: c.slug,
    title: c.title,
    category: c.category,
    type: c.type,
    description: c.description,
    formula_verified: getNested(c, '_formula.formula_verified') ?? '',
    formula_template: c.formula_template ?? '',
    formula_source: getNested(c, '_formula.formula_source') ?? '',
    formula_source_url: getNested(c, '_formula.formula_source_url') ?? '',
    formula_explanation: getNested(c, '_formula.formula_explanation') ?? '',
    example_calculation: getNested(c, '_formula.example_calculation') ?? '',
    meta_title: getNested(c, '_seo.meta_title') ?? '',
    meta_description: getNested(c, '_seo.meta_description') ?? '',
    focus_keyword: getNested(c, '_seo.focus_keyword') ?? '',
    secondary_keywords: getNested(c, '_seo.secondary_keywords') ?? [],
    og_title: getNested(c, '_seo.og_title') ?? '',
    og_description: getNested(c, '_seo.og_description') ?? '',
    canonical_url: getNested(c, '_seo.canonical_url') ?? '',
    schema_type: getNested(c, '_seo.schema_type') ?? '',
    schema_recommendation: getNested(c, '_seo.schema_recommendation') ?? [],
    long_tail_keywords: getNested(c, '_seo.long_tail_keywords') ?? [],
    semantic_keywords: getNested(c, '_seo.semantic_keywords') ?? [],
    paa_keywords: getNested(c, '_seo.paa_keywords') ?? [],
    voice_search_keywords: getNested(c, '_seo.voice_search_keywords') ?? [],
    intro_paragraph: getNested(c, '_content.intro_paragraph') ?? '',
    what_is: getNested(c, '_content.what_is') ?? '',
    how_to_use: getNested(c, '_content.how_to_use') ?? '',
    benefits: getNested(c, '_content.benefits') ?? '',
    important_notes: getNested(c, '_content.important_notes') ?? '',
    pro_tips: getNested(c, '_content.pro_tips') ?? '',
    faq: getNested(c, '_content.faq') ?? [],
    result_explanation: getNested(c, '_content.result_explanation') ?? '',
    input_fields: getNested(c, '_calculator.input_fields') ?? [],
    output_fields: getNested(c, '_calculator.output_fields') ?? [],
    chart_config: getNested(c, '_calculator.chart_config') ?? {},
    validation_rules: getNested(c, '_calculator.validation_rules') ?? {},
    calculator_engine: getNested(c, '_calculator.calculator_engine') ?? '',
    breadcrumb_label: c.breadcrumb_label ?? '',
    category_hierarchy: getNested(c, '_taxonomy.category_hierarchy') ?? [],
    calculator_group: getNested(c, '_taxonomy.calculator_group') ?? '',
    topical_cluster: getNested(c, '_taxonomy.topical_cluster') ?? '',
    internal_link_targets: getNested(c, '_links.internal_link_targets') ?? [],
    related_calculators: getNested(c, '_links.related_calculators') ?? [],
    search_intent: getNested(c, '_scores.search_intent') ?? '',
    traffic_priority: getNested(c, '_scores.traffic_priority') ?? '',
    complexity_level: getNested(c, '_scores.complexity_level') ?? '',
    seo_score: getNested(c, '_scores.seo_score') ?? 0,
    eeat_score: getNested(c, '_scores.eeat_score') ?? 0,
    discover_score: getNested(c, '_scores.discover_score') ?? 0,
    ai_search_score: getNested(c, '_scores.ai_search_score') ?? 0,
    ranking_priority: getNested(c, '_scores.ranking_priority') ?? 5,
    review_required: c.review_required ?? false,
    last_updated: getNested(c, '_meta.last_updated') ?? new Date().toISOString().split('T')[0],
  }
}

const BATCH = 50
let inserted = 0

for (let i = 0; i < calculators.length; i += BATCH) {
  const batch = calculators.slice(i, i + BATCH).map(toRow)
  const { error } = await supabase.from('calculators').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Batch ${i}–${i+BATCH} error:`, error.message)
  } else {
    inserted += batch.length
    console.log(`✓ ${inserted}/${calculators.length} rows inserted`)
  }
}
console.log('\n✅ Import complete')
