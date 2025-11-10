"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { useDiscussion } from "@/hooks/useDiscussion";
import { useAccess } from "@/hooks/useAccess";
import { DiscussionForm } from "@/components/discussion/DiscussionForm";
import { DiscussionList } from "@/components/discussion/DiscussionList";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAccessCheck } from "@/hooks/useAccessCheck";
import { useRbac } from "@/hooks/useRbac";

export default function InventoryDiscussionPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const { inventory } = useInventory(inventoryId);

  const { role, isLoading: isLoadingAccess } = useAccessCheck(inventoryId);
  const { canEdit, isLoading: isLoadingRbac } = useRbac(inventory);
  const isOwner = role === "Owner";

  const { discussions, isLoading, mutate, loadMore, hasMore } =
    useDiscussion(inventoryId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isLoadingPage = isLoading || isLoadingAccess || isLoadingRbac;

  if (!inventoryId) return null;

  if (isLoadingPage && discussions.length === 0) {
    // Show skeleton only for initial load
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-end gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Separator className="my-6" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {canEdit && (
        <DiscussionForm inventoryId={inventoryId} onDiscussionPosted={mutate} />
      )}

      <DiscussionList
        discussions={discussions}
        isLoading={isLoading && discussions.length === 0}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        canDelete={isOwner}
        onDeleteSuccess={mutate}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isLoadingMore={isLoading && discussions.length > 0}
      />
    </div>
  );
}
