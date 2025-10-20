"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Comment, User } from "@/types/shared";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: Comment[] | undefined;
  users: User[] | undefined;
  isLoading: boolean;
}

export function CommentList({ comments, users, isLoading }: CommentListProps) {
  const usersMap = new Map(users?.map((user) => [user.id, user]));

  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-6">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        {comments?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            user={usersMap.get(comment.userId)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
