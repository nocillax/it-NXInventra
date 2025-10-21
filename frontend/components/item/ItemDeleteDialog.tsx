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
import { useTranslations } from "next-intl";

export function ItemDeleteDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId, items } = data;
  const t = useTranslations("ItemDeleteDialog");

  const isModalOpen = isOpen && type === "deleteItem";

  const handleDelete = async () => {
    if (!items || items.length === 0 || !inventoryId) return;
    try {
      await Promise.all(
        items.map((item) => apiFetch(`/items/${item.id}`, { method: "DELETE" }))
      );

      toast.success(t("success_message"));
      globalMutate(`/inventories/${inventoryId}/items`);
      data.onSuccess?.();
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
