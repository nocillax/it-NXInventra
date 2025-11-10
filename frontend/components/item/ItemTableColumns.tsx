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
        <div className="ml-2">
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
        <div className="ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
      size: 40,
    });
  }

  columns.push({
    id: "customId", // ✅ Has id
    header: "Custom ID",
    accessorKey: "customId", // Use the customId from API response
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.original.customId}</div>
    ),
  });

  const fieldColumns =
    inventory?.customFields
      ?.filter((field) => field.showInTable)
      .map(
        (field): ColumnDef<Item> => ({
          id: field.id.toString(), // ✅ Use field id as unique identifier
          header: field.title, // API uses 'title', mock might use 'name'
          accessorFn: (row) => {
            // Handle both field.name and field.title for compatibility
            const fieldName = field.title;
            return row.fields?.[fieldName] ?? "";
          },
          cell: ({ getValue }) => {
            const value = getValue();
            return <div>{value ? String(value) : "-"}</div>;
          },
        })
      ) || [];

  columns.push(...fieldColumns);

  // columns.push({
  //   id: "likes", // ✅ Has id
  //   header: "Likes",
  //   accessorKey: "likes",
  //   cell: ({ row }) => (
  //     <div className="font-mono text-xs">{row.original.likes}</div>
  //   ),
  // });

  return columns;
};
