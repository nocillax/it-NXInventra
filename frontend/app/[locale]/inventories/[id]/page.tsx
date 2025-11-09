"use client";

import { useParams } from "next/navigation";
import { useItems } from "@/hooks/useItems";
import { useInventory } from "@/hooks/useInventory";
import { InventoryItemsView } from "@/components/inventory/InventoryItemsView";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericError } from "@/components/shared/GenericError";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";

export default function InventoryItemsPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    inventory,
    isLoading: isInventoryLoading,
    error: inventoryError,
  } = useInventory(inventoryId);
  const {
    items,
    pagination,
    isLoading: areItemsLoading,
    error: itemsError,
  } = useItems(inventoryId, { page: currentPage, limit: itemsPerPage });

  const isLoading = isInventoryLoading || areItemsLoading;
  const error = inventoryError || itemsError;

  if (error) {
    return <GenericError />;
  }

  if (isLoading || !inventory) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Your existing header and toolbar would go here */}

      <InventoryItemsView
        items={items || []}
        inventory={inventory}
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
