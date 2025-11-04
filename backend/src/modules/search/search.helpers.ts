// search.helpers.ts
// Helper functions for the search module

// This function builds a wildcard query for full-text search
export function buildWildcardQuery(query: string): string {
  return query
    .split(' ')
    .filter((term) => term.length > 0)
    .map((term) => `${term}:*`)
    .join(' & ');
}

// This function validates and normalizes pagination parameters
export function normalizePagination(page: any, limit: any, maxLimit = 50) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), maxLimit);
  return { page: pageNum, limit: limitNum };
}
