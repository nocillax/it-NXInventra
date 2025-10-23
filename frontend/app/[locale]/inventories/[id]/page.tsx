"use client";

import { useParams } from "next/navigation";
import { useItems } from "@/hooks/useItems";
import { useInventory } from "@/hooks/useInventory";
import { InventoryItemsView } from "@/components/inventory/InventoryItemsView";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericError } from "@/components/shared/GenericError";

export default function InventoryItemsPage() {
  const params = useParams();
  const inventoryId = params.id as string;

  const {
    inventory,
    isLoading: isInventoryLoading,
    error: inventoryError,
  } = useInventory(inventoryId);
  const {
    items,
    isLoading: areItemsLoading,
    error: itemsError,
  } = useItems(inventoryId);

  const isLoading = isInventoryLoading || areItemsLoading;
  const error = inventoryError || itemsError;

  if (error) {
    return <GenericError />;
  }

  if (isLoading || !inventory) {
    // This skeleton represents the ItemsTable itself.
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <InventoryItemsView
      items={items || []}
      inventory={inventory}
      isLoading={isLoading}
    />
  );
}
