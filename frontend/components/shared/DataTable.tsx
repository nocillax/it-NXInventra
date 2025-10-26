"use client";

import { flexRender, Table as TanstackTable } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "@/navigation";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  onRowClick?: (row: TData) => void;
  noResultsMessage?: string;
}

export function DataTable<TData extends { id: string }>({
  table,
  onRowClick,
  noResultsMessage = "No results.",
}: DataTableProps<TData>) {
  const router = useRouter();

  return (
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
        {table.getRowModel().rows.map((row, rowIndex) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            onClick={() => {
              if (onRowClick) {
                onRowClick(row.original);
              } else if (row.original.hasOwnProperty("title")) {
                // Default behavior for InventoryTable
                router.push(`/inventories/${row.original.id}`);
              }
            }}
            className={
              onRowClick || row.original.hasOwnProperty("title")
                ? "cursor-pointer"
                : ""
            }
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {table.getRowModel().rows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={table.getAllColumns().length}
              className="h-24 text-center"
            >
              {noResultsMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
