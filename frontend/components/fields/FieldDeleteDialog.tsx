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
import { useModalStore } from "@/stores/useModalStore";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "sonner";
import { useInventory } from "@/hooks/useInventory";

export function FieldDeleteDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId, field } = data;
  const { inventory, mutate } = useInventory(inventoryId);

  const isModalOpen = isOpen && type === "deleteCustomField";

  const handleDelete = async () => {
    if (!field || !inventory) return;
    try {
      const updatedFields = inventory.customFields.filter(
        (f) => f.id !== field.id
      );
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify({ customFields: updatedFields }),
      });
      toast.success(`Field "${field.name}" deleted.`);
      mutate();
      onClose();
    } catch (error) {
      toast.error("Failed to delete field.");
    }
  };

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the field "{field?.name}". This action
            cannot be undone.
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
