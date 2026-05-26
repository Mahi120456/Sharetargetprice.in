import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function slugify(text) {
  return text
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || ''
}

function parseNumber(val) {
  if (!val || val === '') return null
  const cleaned = String(val).replace(/,/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function parseIntSafe(val) {
  if (!val || val === '') return null
  const num = parseInt(String(val).replace(/,/g, ''), 10)
  return isNaN(num) ? null : num
}

const results = []
const csvPath = 'data/500_mutual_funds_PHASE6_INSTITUTIONAL.csv'

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    results.push({
      scheme_code: row.scheme_code || null,
      scheme_name: row.scheme_name || null,
      slug: slugify(row.scheme_name),
      fund_house: row.fund_house || null,
      category: row.category || null,
      sub_category: row.sub_category || null,
      nav: parseNumber(row.nav),
      aum: parseNumber(row.aum),
      expense_ratio: parseNumber(row.expense_ratio),
      returns_1y: parseNumber(row.returns_1y),
      returns_3y: parseNumber(row.returns_3y),
      returns_5y: parseNumber(row.returns_5y),
      returns_since_launch: parseNumber(row.returns_since_launch),
      benchmark: row.benchmark || null,
      riskometer: row.riskometer || null,
      volatility: parseNumber(row.volatility),
      sharpe_ratio: parseNumber(row.sharpe_ratio),
      portfolio_turnover: parseNumber(row.portfolio_turnover),
      fund_manager: row.fund_manager || null,
      fund_manager_tenure: row.fund_manager_tenure || null,
      asset_allocation: row.asset_allocation || null,
      top_holdings: row.top_holdings || null,
      min_sip_amount: parseIntSafe(row.min_sip_amount),
      min_lumpsum: parseIntSafe(row.min_lumpsum),
      launch_date: row.launch_date || null,
      exit_load: row.exit_load || null,
      stamp_duty: row.stamp_duty || null,
      tax_regime: row.tax_regime || null,
      seo_title: row.seo_title || null,
      seo_description: row.seo_description || null,
      keywords: row.keywords || null,
      // New columns (added via ALTER TABLE)
      investment_objective: row.investment_objective || null,
      holdings_date: row.holdings_date || null,
      fund_house_rank: parseIntSafe(row.fund_house_rank),
      // AI content columns (will remain null for now)
      overview: null,
      analysis: null,
      future_outlook: null,
      pros_cons: null,
      faq: null,
    })
  })
  .on('end', async () => {
    console.log(`📄 Parsed ${results.length} rows. Starting upsert...`)

    let success = 0
    let fail = 0

    for (const fund of results) {
      const { error } = await supabase
        .from('mutual_funds')
        .upsert(fund, { onConflict: 'scheme_code' })

      if (error) {
        console.error(`❌ Error for ${fund.scheme_name}:`, error.message)
        fail++
      } else {
        console.log(`✅ Upserted: ${fund.scheme_name} (${fund.scheme_code})`)
        success++
      }
    }

    console.log(`\n🎉 Seeding complete! Success: ${success}, Failed: ${fail}`)
  })
