"use client";

import * as React from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";

import { useModalStore } from "@/stores/useModalStore";
import { Inventory } from "@/types/shared";
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
import { apiFetch } from "@/lib/apiClient";

export function InventoryDeleteDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const t = useTranslations("InventoryDeleteDialog");

  const [isDeleting, setIsDeleting] = React.useState(false);

  const isModalOpen = isOpen && type === "deleteInventory";
  const { inventoryId } = data;

  const handleDelete = async () => {
    if (!inventoryId) return;

    setIsDeleting(true);
    try {
      // Delete the inventory - apiFetch now handles empty responses
      await apiFetch(`/inventories/${inventoryId}`, {
        method: "DELETE",
      });

      toast.success(t("success_message"));
      mutate("/inventories/me"); // Refresh the inventories list
      router.push("/");
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t("failure_message"));
    } finally {
      setIsDeleting(false);
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
          <AlertDialogCancel disabled={isDeleting}>
            {t("cancel_button")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? t("deleting_button") : t("delete_button")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
