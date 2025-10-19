"use client";

import * as React from "react";
import {
  CellContext,
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Inventory, Item } from "@/types/shared";
import { ItemBulkActions } from "./ItemBulkActions";

interface ItemsTableProps {
  items: Item[];
  inventory: Inventory;
  isLoading: boolean;
}

export function ItemsTable({ items, inventory, isLoading }: ItemsTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<Item>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({
          table,
        }: {
          table: ReturnType<typeof useReactTable<Item>>;
        }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: Row<Item> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: Row<Item> }) => (
          <div className="font-mono text-xs">{row.getValue("id")}</div>
        ),
      },
      ...(inventory?.customFields
        .filter((field) => field.showInTable)
        .map((field) => ({
          id: field.name,
          header: field.name,
          accessorFn: (row: Item) => row.fields[field.name],
          cell: ({ getValue }: CellContext<Item, any>) => (
            <div>{String(getValue() ?? "")}</div>
          ),
        })) || []),
    ],
    [inventory]
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading..." : "No items found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
