// lib/calculatorUtils.ts
type NestedCalculator = any;

export function getNested(obj: any, path: string) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

export function flattenCalculator(raw: NestedCalculator) {
  return {
    slug: raw.slug,
    title: raw.title,
    category: raw.category,
    type: raw.type,
    description: raw.description,
    meta_title: getNested(raw, '_seo.meta_title') || raw.title,
    meta_description: getNested(raw, '_seo.meta_description') || '',
    canonical_url: getNested(raw, '_seo.canonical_url') || `https://sharetargetprice.in/calculator/${raw.slug}`,
    intro_paragraph: getNested(raw, '_content.intro_paragraph') || '',
    what_is: getNested(raw, '_content.what_is') || '',
    how_to_use: getNested(raw, '_content.how_to_use') || '',
    formula_explanation: getNested(raw, '_formula.formula_explanation') || '',
    benefits: getNested(raw, '_content.benefits') || '',
    pro_tips: getNested(raw, '_content.pro_tips') || '',
    important_notes: getNested(raw, '_content.important_notes') || '',
    result_explanation: getNested(raw, '_content.result_explanation') || '',
    faq: getNested(raw, '_content.faq') || [],
    input_fields: getNested(raw, '_calculator.input_fields') || [],
    output_fields: getNested(raw, '_calculator.output_fields') || [],
    chart_config: getNested(raw, '_calculator.chart_config') || null,
    validation_rules: getNested(raw, '_calculator.validation_rules') || {},
    related_calculators: getNested(raw, '_links.related_calculators') || [],
  };
}
