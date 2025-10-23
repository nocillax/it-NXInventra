"use client";

import * as React from "react";
import { useInventories } from "@/hooks/useInventories";
import { useAccessList } from "@/hooks/useAccessList";
import { useUsers } from "@/hooks/useUsers";
import { useUserStore } from "@/stores/useUserStore";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { useTranslations } from "next-intl";
import { Inventory, Access, Role } from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { GenericError } from "../shared/GenericError";

const ITEMS_PER_PAGE = 10;

const isUserOwner = (access: Access, userId: string) =>
  access.userId === userId && access.role === "Owner";

const getOwnedInventoryIds = (accessList: Access[], userId: string) => {
  return new Set(
    accessList
      .filter((access) => isUserOwner(access, userId))
      .map((access) => access.inventoryId)
  );
};

const filterInventoriesByOwner = (
  inventories: Inventory[],
  accessList: Access[],
  userId: string
) => {
  if (!inventories || !accessList || !userId) return [];
  const ownedIds = getOwnedInventoryIds(accessList, userId);
  return inventories.filter((inv) => ownedIds.has(inv.id));
};

export function MyInventories() {
  const t = useTranslations("Dashboard");
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

  const myInventories = React.useMemo(
    () =>
      filterInventoriesByOwner(
        inventories || [],
        accessList || [],
        currentUserId
      ),
    [inventories, accessList, currentUserId]
  );

  const paginatedInventories = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return myInventories.slice(startIndex, endIndex);
  }, [myInventories, currentPage]);

  const totalPages = Math.ceil(myInventories.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
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
    <div className="mt-6">
      <h2 className="text-xl font-semibold">{t("my_inventories")}</h2>
      <p className="text-muted-foreground text-sm mb-4">
        {t("my_inventories_description")}
      </p>
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
    </div>
  );
}
