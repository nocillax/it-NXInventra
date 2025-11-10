"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/useModalStore";
import { Item } from "@/types/shared";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";

interface ItemBulkActionsProps<TData> {
  table: Table<TData>;
  inventoryId: string;
  canEdit: boolean;
}

export function ItemBulkActions<TData>({
  table,
  inventoryId,
  canEdit,
}: ItemBulkActionsProps<TData>) {
  const { onOpen } = useModalStore();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const numSelected = selectedRows.length;
  const t = useTranslations("ItemsActions");
  const router = useRouter();

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
            router.push(`/inventories/${inventoryId}/items/create`)
          }
        >
          <Plus className="mr-2 h-4 w-4" /> {t("add_item_button")}
        </Button>
        {numSelected > 0 && (
          <>
            {canEdit && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={numSelected === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" /> {t("delete_item_button")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
