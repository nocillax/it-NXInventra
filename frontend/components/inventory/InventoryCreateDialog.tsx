"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTranslations } from "next-intl";

export function InventoryCreateDialog() {
  const { isOpen, type, onClose } = useModalStore();
  const isModalOpen = isOpen && type === "createInventory";
  const t = useTranslations("InventoryCreateDialog");

  // We will add form handling with react-hook-form later
  const handleCreate = () => {
    console.log("Creating inventory...");
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              {t("title_label")}
            </Label>
            <Input
              id="title"
              placeholder={t("title_placeholder")}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate}>
            {t("create_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
