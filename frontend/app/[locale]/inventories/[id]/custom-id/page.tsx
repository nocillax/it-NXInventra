"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { IDBuilder } from "@/components/customId/IDBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericError } from "@/components/shared/GenericError";

export default function InventoryCustomIdPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const { inventory, isLoading, error } = useInventory(inventoryId);

  if (error) {
    return <GenericError />;
  }

  // The main layout handles the notFound case, but we can show a skeleton
  // while the inventory (needed for the IDBuilder) is loading.
  if (isLoading || !inventory) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return <IDBuilder inventory={inventory} />;
}
