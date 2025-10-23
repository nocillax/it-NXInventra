"use client";

import * as React from "react";
import { useInventories } from "@/hooks/useInventories";
import { useAccessList } from "@/hooks/useAccessList";
import { useUsers } from "@/hooks/useUsers";
import { useUserStore } from "@/stores/useUserStore";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Inventory } from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";
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

export function ExploreInventories() {
  const { user } = useUserStore();
  const {
    inventories,
    isLoading: isLoadingInventories,
    error: inventoriesError,
  } = useInventories();
  const {
    accessList,
    isLoading: isLoadingAccess,
    error: accessListError,
  } = useAccessList();
  const { users, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const [currentPage, setCurrentPage] = React.useState(1);

  const currentUserId = user?.id || "";
  const isLoading = isLoadingInventories || isLoadingAccess || isLoadingUsers;
  const error = inventoriesError || accessListError || usersError;

  const publicInventories = React.useMemo(
    () => filterPublicInventories(inventories || []),
    [inventories]
  );

  const paginatedInventories = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return publicInventories.slice(startIndex, endIndex);
  }, [publicInventories, currentPage]);

  const totalPages = Math.ceil(publicInventories.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <GenericError />;
  }

  return (
    <>
      <InventoryTable
        inventories={paginatedInventories}
        users={users || []}
        accessList={accessList || []}
        isLoading={isLoading}
        currentUserId={currentUserId}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
