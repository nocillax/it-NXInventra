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
  entityType?: "inventory" | "item"; // Add this prop
}

export function DataTable<TData extends { id: string }>({
  table,
  onRowClick,
  noResultsMessage = "No results.",
  entityType, // Add entityType
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
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className={
                onRowClick || entityType
                  ? "cursor-pointer hover:bg-muted/50"
                  : ""
              }
              onClick={(e) => {
                // Prevent row click when clicking on checkbox or other interactive elements
                const target = e.target as HTMLElement;
                if (
                  target.closest('input[type="checkbox"]') ||
                  target.closest("button") ||
                  target.closest("a")
                ) {
                  return;
                }

                // Custom row click handler takes priority
                if (onRowClick) {
                  onRowClick(row.original);
                  return;
                }

                // Default behavior based on entityType
                if (entityType === "inventory") {
                  router.push(`/inventories/${row.original.id}`);
                } else if (entityType === "item") {
                  router.push(`/items/${row.original.id}`);
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
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
