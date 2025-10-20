"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import { Comment, User } from "@/types/shared";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: Comment;
  user?: User;
}

export function CommentItem({ comment, user }: CommentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.timestamp), {
    addSuffix: true,
  });

  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={user?.avatar} alt={user?.name} />
        <AvatarFallback>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">
            {user?.name || "Unknown User"}
          </p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <div className="text-sm text-muted-foreground prose dark:prose-invert prose-p:leading-normal">
          <ReactMarkdown>{comment.message}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
