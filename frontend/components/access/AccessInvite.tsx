"use client";

import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/useModalStore";
import { useTranslations } from "next-intl";

export function AccessInvite({ inventoryId }: { inventoryId: string }) {
  const { onOpen } = useModalStore();
  const t = useTranslations("AccessPages");

  return (
    <div className="flex justify-end">
      <Button onClick={() => onOpen("addCollaborator", { inventoryId })}>
        {t("add_collab_btn")}
      </Button>
    </div>
  );
}
