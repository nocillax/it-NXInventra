"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Discussion } from "@/types/shared";
import { DiscussionItem } from "./DiscussionItem";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { discussionService } from "@/services/discussionService";
import { toast } from "sonner";
import { count } from "console";

interface DiscussionListProps {
  discussions: Discussion[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  canDelete: boolean;
  onDeleteSuccess: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore?: boolean;
}

export function DiscussionList({
  discussions,
  isLoading,
  selectedIds,
  onSelectionChange,
  canDelete,
  onDeleteSuccess,
  hasMore,
  onLoadMore,
  isLoadingMore = false,
}: DiscussionListProps) {
  const t = useTranslations("DiscussionList");
  const locale = useLocale();
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) => discussionService.deleteComment(id))
      );
      toast.success(t("delete_success"));
      onSelectionChange([]);
      onDeleteSuccess();
    } catch (error) {
      toast.error(t("delete_error"));
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      {canDelete && selectedIds.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground font-medium">
            {t("selected_count", { count: formatNumber(selectedIds.length) })}
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t("delete_selected")}
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {discussions.length > 0 ? (
          <>
            {discussions.map((discussion) => (
              <DiscussionItem
                key={discussion.id}
                discussion={discussion}
                isSelected={selectedIds.includes(discussion.id)}
                onSelect={handleSelect}
                canDelete={canDelete}
              />
            ))}
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? t("loading_more") : t("load_more")}
                </Button>
              </div>
            )}

            {isLoadingMore && (
              <div className="flex justify-center pt-2">
                <Skeleton className="h-4 w-32" />
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("no_discussions_yet")}
          </p>
        )}
      </div>
    </div>
  );
}
