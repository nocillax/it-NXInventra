"use client";

import * as React from "react";
import { useInventories } from "@/hooks/useInventories";
import { useAccessList } from "@/hooks/useAccessList";
import { useUsers } from "@/hooks/useUsers";
import { useUserStore } from "@/stores/useUserStore";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Inventory } from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/shared/Pagination";
import { GenericError } from "../shared/GenericError";

const ITEMS_PER_PAGE = 10;

// --- Tiny Helper Functions ---

const isPublic = (inv: Inventory) => inv.public;

const filterPublicInventories = (inventories: Inventory[]) => {
  if (!inventories) return [];
  return inventories.filter(isPublic);
};

// --- Main Component ---

// ExploreInventories.tsx - SIMPLIFIED
export function ExploreInventories() {
  const {
    inventories,
    isLoading: isLoadingInventories,
    error: inventoriesError,
  } = useInventories();

  const [currentPage, setCurrentPage] = React.useState(1);

  // No need to filter - backend already returns only public inventories
  const displayedInventories = inventories || [];

  const paginatedInventories = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return displayedInventories.slice(startIndex, endIndex);
  }, [displayedInventories, currentPage]);

  const totalPages = Math.ceil(displayedInventories.length / ITEMS_PER_PAGE);

  console.log("🔍 Displayed inventories:", displayedInventories);
  console.log("🔍 Paginated inventories:", paginatedInventories);

  if (isLoadingInventories) {
    return <div>Loading inventories...</div>;
  }

  if (inventoriesError) {
    return <GenericError />;
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <InventoryTable
          inventories={paginatedInventories}
          users={[]}
          accessList={[]}
          isLoading={isLoadingInventories}
          currentUserId={""}
          hideRoleColumn={true}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}
