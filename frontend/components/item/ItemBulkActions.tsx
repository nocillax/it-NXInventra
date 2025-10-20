"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/useModalStore";
import { Item } from "@/types/shared";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface ItemBulkActionsProps<TData> {
  table: Table<TData>;
  inventoryId: string;
}

export function ItemBulkActions<TData>({
  table,
  inventoryId,
}: ItemBulkActionsProps<TData>) {
  const { onOpen } = useModalStore();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const numSelected = selectedRows.length;

  const handleEdit = () => {
    const itemToEdit = selectedRows[0].original as Item;
    onOpen("editItem", {
      item: itemToEdit,
      inventoryId,
      onSuccess: () => table.resetRowSelection(),
    });
  };

  const handleDelete = () => {
    const itemsToDelete = selectedRows.map((row) => row.original as Item);
    onOpen("deleteItem", {
      items: itemsToDelete,
      inventoryId,
      onSuccess: () => table.resetRowSelection(),
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Button
          onClick={() =>
            onOpen("createItem", {
              inventoryId,
              onSuccess: () => table.resetRowSelection(),
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
        {numSelected > 0 && (
          <>
            <Button
              variant="outline"
              onClick={handleEdit}
              disabled={numSelected !== 1}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={numSelected === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
