// category.helpers.ts
// Helper functions for the category module

// This function checks if a search query is valid (at least 2 characters)
export function isValidCategoryQuery(query: string): boolean {
  return !!query && query.length >= 2;
}
