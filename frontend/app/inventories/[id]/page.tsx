"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { useItems } from "@/hooks/useItems";
import { ItemsTable } from "@/components/item/ItemsTable";

export default function InventoryItemsPage() {
  const params = useParams();
  const inventoryId = params.id as string;

  const { inventory, isLoading: isInventoryLoading } =
    useInventory(inventoryId);
  const { items, isLoading: areItemsLoading, mutate } = useItems(inventoryId);

  return (
    <div>
      {inventory && items && (
        <ItemsTable
          items={items}
          inventory={inventory}
          isLoading={isInventoryLoading || areItemsLoading}
        />
      )}
    </div>
  );
}
