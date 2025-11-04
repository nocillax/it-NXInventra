// tag.helpers.ts
// Helper functions for the tag module

// This function checks if a tag name is valid (not empty, trimmed, and at least 2 chars)
export function isValidTagName(name: string): boolean {
  return !!name && name.trim().length >= 2;
}

// This function sorts tags by inventory count descending
export function sortTagsByInventoryCount(
  tags: { inventoryCount: number }[],
): void {
  tags.sort((a, b) => b.inventoryCount - a.inventoryCount);
}

// This function maps a tag entity to a response object with count
export function mapTagWithCount(tag: any) {
  return {
    id: tag.id,
    name: tag.name,
    createdAt: tag.createdAt,
    inventoryCount: tag.inventories?.length || 0,
  };
}
