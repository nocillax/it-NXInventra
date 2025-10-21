"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { InventorySettingsForm } from "@/components/settings/InventorySettingsForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventorySettingsPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const { inventory, isLoading, mutate } = useInventory(inventoryId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  if (!inventory) return <p>Inventory not found.</p>;

  return <InventorySettingsForm inventory={inventory} onUpdate={mutate} />;
}
