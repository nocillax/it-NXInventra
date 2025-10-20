"use client";

import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/useModalStore";

export function AccessInvite({ inventoryId }: { inventoryId: string }) {
  const { onOpen } = useModalStore();

  return (
    <div className="flex justify-end">
      <Button onClick={() => onOpen("addCollaborator", { inventoryId })}>
        Add Collaborator
      </Button>
    </div>
  );
}
