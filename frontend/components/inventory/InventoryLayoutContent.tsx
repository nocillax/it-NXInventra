"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericError } from "@/components/shared/GenericError";

interface InventoryLayoutContentProps {
  children: React.ReactNode;
}

export function InventoryLayoutContent({
  children,
}: InventoryLayoutContentProps) {
  const params = useParams();
  const inventoryId = params.id as string;

  const { inventory, isLoading, error } = useInventory(inventoryId);

  if (error) {
    return <GenericError />;
  }

  if (isLoading || !inventory) {
    return (
      <div className="space-y-4">
        {/* Skeleton for header */}
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        {/* Skeleton for toolbar */}
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        {/* Skeleton for content */}
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InventoryHeader inventory={inventory} />
      <InventoryToolbar inventory={inventory} />
      {children}
    </div>
  );
}
