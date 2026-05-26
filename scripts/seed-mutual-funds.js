import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
)

const results = []

function slugify(text) {
return text
?.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/(^-|-$)/g, '')
}

fs.createReadStream('data/500_mutual_funds_PHASE6_INSTITUTIONAL.csv')
.pipe(csv())
.on('data', (row) => {

results.push({
  scheme_code: row.scheme_code,
  scheme_name: row.scheme_name,
  slug: slugify(row.scheme_name),

  fund_house: row.fund_house,
  category: row.category,
  sub_category: row.sub_category,

  nav: row.nav || null,
  aum: row.aum || null,
  expense_ratio: row.expense_ratio || null,

  returns_1y: row.returns_1y || null,
  returns_3y: row.returns_3y || null,
  returns_5y: row.returns_5y || null,
  returns_since_launch: row.returns_since_launch || null,

  benchmark: row.benchmark,
  riskometer: row.riskometer,

  volatility: row.volatility || null,
  sharpe_ratio: row.sharpe_ratio || null,
  portfolio_turnover: row.portfolio_turnover || null,

  fund_manager: row.fund_manager,
  fund_manager_tenure: row.fund_manager_tenure,

  asset_allocation: row.asset_allocation,
  top_holdings: row.top_holdings,

  min_sip_amount: row.min_sip_amount || null,
  min_lumpsum: row.min_lumpsum || null,

  launch_date: row.launch_date,
  exit_load: row.exit_load,
  stamp_duty: row.stamp_duty,
  tax_regime: row.tax_regime,

  seo_title: row.seo_title,
  seo_description: row.seo_description,
  keywords: row.keywords
})

})

.on('end', async () => {

for (const fund of results) {

  const { error } = await supabase
    .from('mutual_funds')
    .upsert(fund, {
      onConflict: 'scheme_code'
    })

  if (error) {
    console.log('❌ Error:', fund.scheme_name)
    console.log(error.message)
  } else {
    console.log('✅ Inserted:', fund.scheme_name)
  }
}

console.log('🚀 All mutual funds imported successfully')

})
