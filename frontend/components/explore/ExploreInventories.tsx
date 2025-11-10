"use client";

import * as React from "react";
import { useInventories } from "@/hooks/useInventories";
import { Inventory } from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/shared/Pagination";
import { GenericError } from "../shared/GenericError";
import { getInventoryTableColumns } from "../inventory/InventoryTableColumns";
import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../shared/DataTable";
import { useTranslations } from "next-intl";

const ITEMS_PER_PAGE = 10;

export function ExploreInventories() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const t = useTranslations("InventoryTable");

  const {
    inventories,
    pagination,
    isLoading: isLoadingInventories,
    error: inventoriesError,
  } = useInventories(currentPage, ITEMS_PER_PAGE);

  // Move ALL hooks to the top, before any conditionals
  const columns = React.useMemo(
    () => getInventoryTableColumns(t, new Map(), [], "", true),
    [t]
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

  // Now conditionals can come after hooks
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
        <DataTable
          table={table}
          noResultsMessage={t("no_inventories")}
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
  );
}
