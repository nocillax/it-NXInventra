"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentWithUser } from "@/types/shared";
import { CommentItem } from "./CommentItem";
import { useTranslations } from "next-intl";

interface CommentListProps {
  comments: CommentWithUser[];
  isLoadingMore: boolean | undefined;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

export function CommentList({
  comments,
  isLoadingMore,
  loadMoreRef,
}: CommentListProps) {
  const t = useTranslations("DiscussionTab");

  return (
    <ScrollArea className="max-h-[60vh] pr-2 sm:pr-4">
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            {t("no_comments_yet")}
          </p>
        )}
        <div ref={loadMoreRef} className="h-1">
          {isLoadingMore && <Skeleton className="h-10 w-full" />}
        </div>
      </div>
    </ScrollArea>
  );
}
