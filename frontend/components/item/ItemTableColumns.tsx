"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Inventory, Item } from "@/types/shared";
import { generateItemId } from "@/lib/formatters";
import { Checkbox } from "@/components/ui/checkbox";

export const getItemTableColumns = (
  inventory: Inventory,
  itemSequenceMap: Map<string, number>,
  canEdit: boolean
): ColumnDef<Item>[] => {
  const columns: ColumnDef<Item>[] = [];

  if (canEdit) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    });
  }

  columns.push({
    id: "customId",
    header: "ID",
    cell: ({ row }) => {
      const sequence = itemSequenceMap.get(row.original.id) || 0;
      const generatedId = generateItemId(inventory.idFormat, sequence);
      return <div className="font-mono text-xs">{generatedId}</div>;
    },
  });

  const fieldColumns =
    inventory?.customFields
      .filter((field) => field.showInTable)
      .map(
        (field): ColumnDef<Item> => ({
          id: field.name,
          header: field.name,
          accessorFn: (row) => row.fields[field.name],
          cell: ({ getValue }) => <div>{String(getValue() ?? "")}</div>,
        })
      ) || [];

  columns.push(...fieldColumns);

  return columns;
};
