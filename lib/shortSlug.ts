export function getShortSlugFromName(name: string): string {
  let slug = name
    .toLowerCase()
    .replace(/ - direct plan( - growth)?/gi, '')
    .replace(/ - growth option/gi, '')
    .replace(/ fund/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (slug.length > 35) slug = slug.substring(0, 35).replace(/-$/, '');
  return slug;
}
