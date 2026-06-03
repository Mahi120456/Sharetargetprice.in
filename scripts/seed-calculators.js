import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: { transport: ws },
    auth: { persistSession: false }
  }
);

// Helper to clean BOM and trim column names
function cleanKeys(obj) {
  const cleaned = {};
  for (let key in obj) {
    // Remove BOM (U+FEFF) and trim whitespace
    const cleanKey = key.replace(/^\uFEFF/, '').trim();
    cleaned[cleanKey] = obj[key];
  }
  return cleaned;
}

async function seedCalculators() {
  const results = [];
  const filePath = path.join(process.cwd(), 'data', 'calculators_enhanced.csv');

  console.log(`📂 Reading CSV from: ${filePath}`);

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (row) => {
        // Clean BOM from keys
        const cleanedRow = cleanKeys(row);
        results.push(cleanedRow);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📄 Read ${results.length} calculators`);

  for (const row of results) {
    // Now row.slug will be properly accessible
    if (!row.slug) {
      console.warn(`⚠️ Skipping row without slug:`, row);
      continue;
    }

    const safeParse = (str) => {
      if (!str || str === '') return null;
      try {
        return JSON.parse(str);
      } catch (e) {
        return null;
      }
    };

    const splitArray = (str) => {
      if (!str || str === '') return null;
      return str.split(',').map(s => s.trim()).filter(s => s);
    };

    const data = {
      slug: row.slug,
      title: row.title,
      category: row.category,
      type: row.type,
      description: row.description,
      formula_template: row.formula_template,
      schema_type: row.schema_type,
      breadcrumb_label: row.breadcrumb_label,
      canonical_url: row.canonical_url,
      last_updated: row.last_updated,
      formula_verified: row.formula_verified,
      formula_source: row.formula_source,
      formula_source_url: row.formula_source_url,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      focus_keyword: row.focus_keyword,
      secondary_keywords: splitArray(row.secondary_keywords),
      intro_paragraph: row.intro_paragraph,
      what_is: row.what_is,
      how_to_use: row.how_to_use,
      formula_explanation: row.formula_explanation,
      example_calculation: row.example_calculation,
      benefits: row.benefits,
      important_notes: row.important_notes,
      pro_tips: row.pro_tips,
      faq: safeParse(row.faq),
      og_title: row.og_title,
      og_description: row.og_description,
      related_calculators: row.related_calculators,
      related_articles: row.related_articles,
      input_fields: safeParse(row.input_fields),
      output_fields: splitArray(row.output_fields),
      chart_config: safeParse(row.chart_config),
      result_explanation: row.result_explanation,
      validation_rules: safeParse(row.validation_rules),
      calculator_engine: row.calculator_engine,
      category_hierarchy: splitArray(row.category_hierarchy),
      calculator_group: row.calculator_group,
      topical_cluster: row.topical_cluster,
      internal_link_targets: splitArray(row.internal_link_targets),
      search_intent: row.search_intent,
      traffic_priority: row.traffic_priority,
      complexity_level: row.complexity_level,
      schema_recommendation: row.schema_recommendation,
      long_tail_keywords: splitArray(row.long_tail_keywords),
      semantic_keywords: splitArray(row.semantic_keywords),
      paa_keywords: splitArray(row.paa_keywords),
      voice_search_keywords: splitArray(row.voice_search_keywords),
      seo_score: row.seo_score ? parseInt(row.seo_score) : null,
      eeat_score: row.eeat_score ? parseInt(row.eeat_score) : null,
      discover_score: row.discover_score ? parseInt(row.discover_score) : null,
      ai_search_score: row.ai_search_score ? parseInt(row.ai_search_score) : null,
      ranking_priority: row.ranking_priority ? parseInt(row.ranking_priority) : null,
      review_required: row.review_required === 'TRUE' || row.review_required === 'true',
      updated_at: new Date().toISOString(),
    };

    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    const { error } = await supabase
      .from('calculators')
      .upsert(data, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Error upserting ${row.slug}:`, error.message);
    } else {
      console.log(`✅ ${row.slug}`);
    }
  }
  console.log('🎉 Seed completed.');
}

seedCalculators().catch(console.error);
