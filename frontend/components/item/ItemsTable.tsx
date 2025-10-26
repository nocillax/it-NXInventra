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
import { getCoreRowModel } from "@tanstack/react-table";

interface ItemsTableProps {
  items: Item[];
  inventory: Inventory;
  isLoading: boolean;
}

export function ItemsTable({ items, inventory, isLoading }: ItemsTableProps) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const itemSequenceMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (items) {
      items
        .slice()
        .reverse()
        .forEach((item, index) => map.set(item.id, index + 1));
    }
    return map;
  }, [items]);

  const columns: ColumnDef<Item>[] = React.useMemo(
    () => getItemTableColumns(inventory, itemSequenceMap),
    [inventory, itemSequenceMap]
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

  return (
    <div className="space-y-4">
      <ItemBulkActions table={table} inventoryId={inventory.id} />
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <DataTable
          table={table}
          noResultsMessage={isLoading ? "Loading..." : "No items found."}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
