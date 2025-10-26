"use client";

import * as React from "react";
import { useComments } from "@/hooks/useComments";
import { useUsers } from "@/hooks/useUsers";
import { CommentForm } from "@/components/discussion/CommentForm";
import { CommentList } from "@/components/discussion/CommentList";
import { Comment, CommentWithUser } from "@/types/shared";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { useRbac } from "@/hooks/useRbac";
import { useInventory } from "@/hooks/useInventory";

export default function InventoryDiscussionPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const { inventory } = useInventory(inventoryId);
  const { canEdit } = useRbac(inventory);

  const {
    comments,
    isLoading: isLoadingInitialComments,
    mutate: mutateComments,
    size,
    setSize,
    isLoadingMore,
    isReachingEnd,
  } = useComments(inventoryId);
  const { users, isLoading: isLoadingUsers } = useUsers();

  const isLoading = isLoadingInitialComments || isLoadingUsers;

  const commentsWithUsers: CommentWithUser[] = React.useMemo(() => {
    if (!comments || !users) return [];
    const usersMap = new Map(users.map((user) => [user.id, user]));
    return comments.flat().map((comment: Comment) => ({
      ...comment,
      user: usersMap.get(comment.userId),
    }));
  }, [comments, users]);

  const sortedComments = React.useMemo(() => {
    return commentsWithUsers.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [commentsWithUsers]);

  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore && !isReachingEnd) {
          setSize(size + 1);
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoadingMore, isReachingEnd, setSize, size]);

  if (!inventoryId) return null;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-end gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="h-px w-full" />
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
    <div className="max-w-2xl mx-auto">
      {canEdit && (
        <CommentForm
          inventoryId={inventoryId}
          onCommentPosted={mutateComments}
        />
      )}
      <Separator className="my-6" />
      <CommentList
        comments={sortedComments}
        isLoadingMore={isLoadingMore}
        loadMoreRef={loadMoreRef}
      />
    </div>
  );
}
