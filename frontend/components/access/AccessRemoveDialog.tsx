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
import { useTranslations } from "next-intl";
import { accessService } from "@/services/accessService";

export function AccessRemoveDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId, userId } = data; // Change from 'access' to 'userId'
  const { mutate } = useAccess(inventoryId || "");
  const t = useTranslations("AccessRemoveDialog");

  const isModalOpen = isOpen && type === "removeAccess";

  const handleDelete = async () => {
    if (!userId || !inventoryId) return;

    try {
      await accessService.removeAccess(inventoryId, userId);
      toast.success(t("remove_success"));
      mutate();
      onClose();
    } catch (error) {
      toast.error(t("remove_error"));
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
            {t("remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
