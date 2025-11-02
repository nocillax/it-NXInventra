"use client";

import * as React from "react";
import {
  ColumnDef,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Inventory, Item } from "@/types/shared";
import { ItemBulkActions } from "./ItemBulkActions";
import { DataTable } from "@/components/shared/DataTable";
import { getItemTableColumns } from "./ItemTableColumns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { useRbac } from "@/hooks/useRbac";
import { getCoreRowModel } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

// components/item/ItemsTable.tsx - FIXED
interface ItemsTableProps {
  items: Item[];
  inventory: Inventory;
  isLoading: boolean;
}

export function ItemsTable({ items, inventory, isLoading }: ItemsTableProps) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const { canEdit, isOwner } = useRbac(inventory);
  const t = useTranslations("ItemsActions");

  const router = useRouter();

  const columns: ColumnDef<Item>[] = React.useMemo(
    () => getItemTableColumns(inventory, new Map(), canEdit), // Pass empty map
    [inventory, canEdit]
  );

  const table = useReactTable({
    data: items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  // Handle row click - navigate to item detail page
  const handleRowClick = (item: Item) => {
    router.push(`/items/${item.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 border border-dashed rounded-lg text-center p-4">
        <p className="text-muted-foreground mb-4">{t("no_items_message")}</p>
        {canEdit && (
          <ItemBulkActions
            table={table}
            inventoryId={inventory.id}
            isOwner={isOwner}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <ItemBulkActions
          table={table}
          inventoryId={inventory.id}
          isOwner={isOwner}
        />
      )}
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <DataTable
          table={table}
          noResultsMessage={t("no_items")}
          entityType="item" // This will navigate to /items/:id
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
