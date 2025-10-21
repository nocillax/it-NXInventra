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
import { useTranslations } from "next-intl";

export function FieldDeleteDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId, field } = data;
  const { inventory, mutate } = useInventory(inventoryId);

  const isModalOpen = isOpen && type === "deleteCustomField";
  const t = useTranslations("FieldDeleteDialog");

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
      toast.success(t("success_message"));
      mutate();
      onClose();
    } catch (error) {
      toast.error(t("failure_message"));
    }
  };

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
