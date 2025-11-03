"use client";

import { CellContext, ColumnDef } from "@tanstack/react-table";
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

// InventoryTableColumns.tsx - UPDATED FOR NEW API STRUCTURE
export const getInventoryTableColumns = (
  t: TFunction,
  usersMap: Map<string, User>,
  accessList: Access[],
  currentUserId: string,
  hideRoleColumn?: boolean
): ColumnDef<Inventory>[] => [
  {
    id: "title",
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
    id: "category",
    accessorKey: "category",
    header: t("category"),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">
        {row.original.category || "-"}
      </div>
    ),
  },
  {
    id: "createdBy",
    accessorKey: "createdBy",
    header: t("createdBy"),
    cell: ({ row }) => {
      // Use creator object from API response
      const creator = row.original.creator;
      if (creator?.id === currentUserId) {
        return t("you");
      }
      return creator?.name || row.original.createdBy || "-";
    },
  },
  {
    id: "visibility",
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
  // Conditionally include role column
  ...(hideRoleColumn
    ? []
    : [
        {
          id: "your_role",
          header: t("your_role"),
          cell: ({ row }: CellContext<any, unknown>) => {
            const role =
              row.original.accessRecords?.[0]?.role || "Public Viewer";
            return t(`role_${role.toLowerCase().replace(" ", "_")}`);
          },
        },
      ]),
  {
    id: "tags",
    accessorKey: "tags",
    header: t("tags"),
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags || tags.length === 0) return "-";

      // Extract tag names from tag objects
      const tagNames = tags.map((tag) =>
        typeof tag === "string" ? tag : tag.name
      );
      const displayedTags = tagNames.slice(0, 2);
      const remainingTags = tagNames.length - displayedTags.length;

      return (
        <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
          {displayedTags.map((tag, index) => (
            <Badge key={index} variant="secondary">
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
                  <p>{tagNames.slice(2).join(", ")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
];
