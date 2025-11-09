"use client";

import * as React from "react";
import { useInventories } from "@/hooks/useInventories";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Inventory } from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/shared/Pagination";
import { GenericError } from "../shared/GenericError";

const ITEMS_PER_PAGE = 10;

export function ExploreInventories() {
  const [currentPage, setCurrentPage] = React.useState(1);

  const {
    inventories,
    pagination,
    isLoading: isLoadingInventories,
    error: inventoriesError,
  } = useInventories(currentPage, ITEMS_PER_PAGE);

  const totalPages = pagination?.totalPages || 1;

  if (isLoadingInventories) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (inventoriesError) {
    return <GenericError />;
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <InventoryTable
          inventories={inventories}
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
