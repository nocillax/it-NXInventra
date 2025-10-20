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
import { useAccess } from "@/hooks/useAccess";

export function AccessRemoveDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId, access } = data;
  const { mutate } = useAccess(inventoryId);

  const isModalOpen = isOpen && type === "removeAccess";

  const handleDelete = async () => {
    if (!access) return;
    try {
      await apiFetch(`/access/${access.id}`, { method: "DELETE" });
      toast.success(`User access removed.`);
      mutate();
      onClose();
    } catch (error) {
      toast.error("Failed to remove access.");
    }
  };

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove this user's access to the inventory.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
