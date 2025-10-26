"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Inventory, Item } from "@/types/shared";
import { generateItemId } from "@/lib/formatters";
import { Checkbox } from "@/components/ui/checkbox";

export const getItemTableColumns = (
  inventory: Inventory,
  itemSequenceMap: Map<string, number>
): ColumnDef<Item>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "customId",
    header: "ID",
    cell: ({ row }) => {
      const sequence = itemSequenceMap.get(row.original.id) || 0;
      const generatedId = generateItemId(inventory.idFormat, sequence);
      return <div className="font-mono text-xs">{generatedId}</div>;
    },
  },
  ...(inventory?.customFields
    .filter((field) => field.showInTable)
    .map(
      (field): ColumnDef<Item> => ({
        id: field.name,
        header: field.name,
        accessorFn: (row) => row.fields[field.name],
        cell: ({ getValue }) => <div>{String(getValue() ?? "")}</div>,
      })
    ) || []),
];
