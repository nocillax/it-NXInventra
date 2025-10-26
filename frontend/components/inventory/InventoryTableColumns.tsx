"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Inventory, User, Access } from "@/types/shared";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Package, Lock, Globe } from "lucide-react";

type TFunction = (key: string) => string;

export const getInventoryTableColumns = (
  t: TFunction,
  usersMap: Map<string, User>,
  accessList: Access[],
  currentUserId: string
): ColumnDef<Inventory>[] => [
  {
    accessorKey: "title",
    header: t("name"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-semibold max-w-[250px] truncate">
        <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="truncate">{row.original.title}</span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: t("category"),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">
        {row.original.category || "-"}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: t("createdBy"),
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      return createdBy === currentUserId
        ? t("you")
        : usersMap.get(createdBy)?.name || createdBy;
    },
  },
  {
    accessorKey: "public",
    header: t("visibility"),
    cell: ({ row }) => (
      <Badge variant="outline" className="flex items-center gap-1 w-fit">
        {row.original.public ? (
          <Globe className="h-3 w-3" />
        ) : (
          <Lock className="h-3 w-3" />
        )}
        {row.original.public ? t("public") : t("private")}
      </Badge>
    ),
  },
  {
    id: "your_role",
    header: t("your_role"),
    cell: ({ row }) => {
      const inventory = row.original;
      const userAccess = accessList.find(
        (a) => a.inventoryId === inventory.id && a.userId === currentUserId
      );
      if (userAccess) {
        return t(`role_${userAccess.role.toLowerCase()}`);
      }
      return inventory.public ? t("role_public_viewer") : t("role_no_access");
    },
  },
  {
    accessorKey: "tags",
    header: t("tags"),
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags || tags.length === 0) return "-";

      const displayedTags = tags.slice(0, 2);
      const remainingTags = tags.length - displayedTags.length;

      return (
        <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
          {displayedTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {remainingTags > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline">+{remainingTags}</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tags.slice(2).join(", ")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
];
