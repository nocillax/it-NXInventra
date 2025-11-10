// components/dashboard/SharedInventoriesTab.tsx
"use client";

import * as React from "react";
import { useSharedInventories } from "@/hooks/useSharedInventories";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/shared/Pagination";
import { GenericError } from "@/components/shared/GenericError";
import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { getInventoryTableColumns } from "../inventory/InventoryTableColumns";
import { DataTable } from "../shared/DataTable";

const ITEMS_PER_PAGE = 10;

export function SharedInventoriesTab() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const tableT = useTranslations("InventoryTable");

  const { inventories, pagination, isLoading, error } = useSharedInventories(
    currentPage,
    ITEMS_PER_PAGE
  );

  // Move hooks to top
  const columns = React.useMemo(
    () =>
      getInventoryTableColumns(tableT, new Map(), [], user?.id || "", false),
    [tableT, user?.id]
  );

  const table = useReactTable({
    data: inventories || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

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
            <DataTable
              table={table}
              noResultsMessage={tableT("no_inventories")}
              entityType="inventory"
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
