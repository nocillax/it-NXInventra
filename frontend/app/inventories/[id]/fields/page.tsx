"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { CustomFieldsEditor } from "@/components/fields/CustomFieldsEditor";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryFieldsPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const { inventory, isLoading, mutate } = useInventory(inventoryId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!inventory) return <p>Inventory not found.</p>;

  return <CustomFieldsEditor inventory={inventory} onUpdate={mutate} />;
}
