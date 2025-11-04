"use client";

import { flexRender, Table as TanstackTable } from "@tanstack/react-table";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  onRowClick?: (row: TData) => void;
  noResultsMessage?: string;
  entityType?: "inventory" | "item";
  inventoryId?: string;
}

export function DataTable<TData extends { id: string }>({
  table,
  onRowClick,
  noResultsMessage = "No results.",
  entityType,
  inventoryId,
}: DataTableProps<TData>) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : (
                  <div className="flex items-center">
                    {header.column.getCanSort() ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="ml-2 h-4 w-4" />,
                          desc: <ChevronDown className="ml-2 h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? (
                          <ChevronsUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </div>
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
                  router.push(
                    `/inventories/${inventoryId}/items/${row.original.id}`
                  );
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
