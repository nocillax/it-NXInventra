"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mutate as globalMutate } from "swr";
import { useModalStore } from "@/stores/useModalStore";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "sonner";

export function ItemDeleteDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId, item } = data;

  const isModalOpen = isOpen && type === "deleteItem";

  const handleDelete = async () => {
    if (!item || !inventoryId) return;
    try {
      await apiFetch(`/items/${item.id}`, { method: "DELETE" }); // This is a mock API call
      toast.success(`Item ${item.id} deleted.`);
      globalMutate(`/inventories/${inventoryId}/items`);
      data.onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to delete item.");
    }
  };

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the item {item?.id}. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
