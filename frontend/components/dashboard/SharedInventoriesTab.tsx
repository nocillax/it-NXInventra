// components/dashboard/SharedInventoriesTab.tsx
"use client";

import * as React from "react";
import { useSharedInventories } from "@/hooks/useSharedInventories";
import { useAuth } from "@/hooks/useAuth";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/shared/Pagination";
import { GenericError } from "@/components/shared/GenericError";

const ITEMS_PER_PAGE = 10;

export function SharedInventoriesTab() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);

  const { inventories, pagination, isLoading, error } = useSharedInventories(
    currentPage,
    ITEMS_PER_PAGE
  );

  const totalPages = pagination?.totalPages || 1;

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
    <div className="mt-4">
      {inventories.length === 0 ? (
        <div className="flex items-center justify-center h-40 border border-dashed rounded-lg">
          <p className="text-muted-foreground">{t("no_shared_inventories")}</p>
        </div>
      ) : (
        <>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <InventoryTable
              inventories={inventories}
              users={[]}
              accessList={[]}
              isLoading={isLoading}
              currentUserId={user?.id || ""}
              hideRoleColumn={false} // Show role column
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
      )}
    </div>
  );
}
