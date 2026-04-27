// Quarter slug helpers.
// DB stores e.g. "Q3 FY2026"; URLs use "Q3-FY2026" for cleanliness.

export function quarterToSlug(quarter: string): string {
  return quarter.replace(/\s+/g, "-");
}

export function slugToQuarter(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, " ");
}

export function symbolToSlug(symbol: string): string {
  return symbol.toUpperCase();
}

export function companyHref(symbol: string, quarter: string): string {
  return `/company/${symbolToSlug(symbol)}/${quarterToSlug(quarter)}`;
}
