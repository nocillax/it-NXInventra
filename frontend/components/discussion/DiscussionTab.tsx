"use client";

import { useComments } from "@/hooks/useComments";
import { useUsers } from "@/hooks/useUsers";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface DiscussionTabProps {
  inventoryId: string;
}

export function DiscussionTab({ inventoryId }: DiscussionTabProps) {
  const {
    comments,
    isLoading: isLoadingComments,
    mutate,
  } = useComments(inventoryId);
  const { users, isLoading: isLoadingUsers } = useUsers();

  const isLoading = isLoadingComments || isLoadingUsers;

  return (
    <div className="flex flex-col h-[60vh]">
      <CommentList comments={comments} users={users} isLoading={isLoading} />
      <div className="mt-4 pt-4 border-t">
        <CommentForm inventoryId={inventoryId} onCommentPosted={mutate} />
      </div>
    </div>
  );
}
