"use client";

import * as React from "react";
import { useInventories } from "@/hooks/useInventories";
import { useAccessList } from "@/hooks/useAccessList";
import { useUsers } from "@/hooks/useUsers";
import { useUserStore } from "@/stores/useUserStore";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Inventory, Access, Role } from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/shared/Pagination";
import { GenericError } from "../shared/GenericError";

const ITEMS_PER_PAGE = 10;

// --- Tiny Helper Functions ---

const hasEditorRole = (access: Access) => access.role === "Editor";
const hasViewerRoleOnPrivate = (access: Access, inv: Inventory) =>
  access.role === "Viewer" && !inv.public;

const isSharedWithUser = (inv: Inventory, myAccess: Access | undefined) => {
  if (!myAccess) return false;
  return hasEditorRole(myAccess) || hasViewerRoleOnPrivate(myAccess, inv);
};

const filterSharedInventories = (
  inventories: Inventory[],
  accessList: Access[],
  userId: string
) => {
  if (!inventories || !accessList || !userId) return [];
  return inventories.filter((inv) => {
    const myAccess = accessList.find(
      (access) => access.inventoryId === inv.id && access.userId === userId
    );
    return isSharedWithUser(inv, myAccess);
  });
};

// --- Main Component ---

export function SharedInventories() {
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

  const sharedInventories = React.useMemo(
    () =>
      filterSharedInventories(
        inventories || [],
        accessList || [],
        currentUserId
      ),
    [inventories, accessList, currentUserId]
  );

  const paginatedInventories = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sharedInventories.slice(startIndex, endIndex);
  }, [sharedInventories, currentPage]);

  const totalPages = Math.ceil(sharedInventories.length / ITEMS_PER_PAGE);

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
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <InventoryTable
          inventories={paginatedInventories}
          users={users || []}
          accessList={accessList || []}
          isLoading={isLoading}
          currentUserId={currentUserId}
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
