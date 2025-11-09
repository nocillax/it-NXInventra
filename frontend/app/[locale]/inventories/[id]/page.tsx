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

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, pagination.total)} of{" "}
            {pagination.total} items
          </div>
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                Page {currentPage} of {pagination.totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
