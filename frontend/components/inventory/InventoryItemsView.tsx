"use client";

import { ItemsTable } from "@/components/item/ItemsTable";
import { Item, Inventory } from "@/types/shared";

interface InventoryItemsViewProps {
  items: Item[];
  inventory: Inventory;
  isLoading: boolean;
}

export function InventoryItemsView({
  items,
  inventory,
  isLoading,
}: InventoryItemsViewProps) {
  return (
    <ItemsTable items={items} inventory={inventory} isLoading={isLoading} />
  );
}
