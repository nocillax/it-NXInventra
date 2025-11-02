"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import { Discussion } from "@/types/shared";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";

interface DiscussionItemProps {
  discussion: Discussion;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  canDelete: boolean;
}

export function DiscussionItem({
  discussion,
  isSelected,
  onSelect,
  canDelete,
}: DiscussionItemProps) {
  const timeAgo = formatDistanceToNow(new Date(discussion.timestamp), {
    addSuffix: true,
  });

  const t = useTranslations("DiscussionItem");

  return (
    <div className="flex items-start space-x-3 sm:space-x-4">
      {canDelete && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            onSelect(discussion.id, checked as boolean)
          }
          className="mt-3"
        />
      )}
      <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
        <AvatarFallback>
          {discussion.user?.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">
            {discussion.user?.name || t("unknown_user")}
          </p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <div className="text-sm text-muted-foreground prose dark:prose-invert prose-p:leading-normal">
          <ReactMarkdown>{discussion.message}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
