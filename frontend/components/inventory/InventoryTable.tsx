"use client";

import * as React from "react";
import { useRouter } from "@/navigation";
import { Inventory, User, Access, Role } from "@/types/shared"; // Import Access and Role
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Package, Lock, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryTableProps {
  inventories: Inventory[];
  users: User[]; // To map ownerId to user name
  accessList: Access[]; // To determine current user's role for each inventory
  isLoading: boolean;
  currentUserId: string; // To display "You" as owner
}

export function InventoryTable({
  inventories,
  users,
  accessList, // Destructure accessList
  isLoading,
  currentUserId,
}: InventoryTableProps) {
  const t = useTranslations("InventoryTable");
  const router = useRouter();
  const usersMap = React.useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!inventories || inventories.length === 0) {
    return <p className="text-muted-foreground">{t("no_inventories")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">{t("name")}</TableHead>
          <TableHead>{t("category")}</TableHead>
          <TableHead>{t("createdBy")}</TableHead>
          <TableHead>{t("visibility")}</TableHead>
          <TableHead>{t("tags")}</TableHead>
          <TableHead>{t("your_role")}</TableHead> {/* New column header */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventories.map((inventory) => (
          <TableRow
            key={inventory.id}
            onClick={() => router.push(`/inventories/${inventory.id}`)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />{" "}
              {inventory.title}
            </TableCell>
            <TableCell>{inventory.category || "-"}</TableCell>
            <TableCell>
              {inventory.createdBy === currentUserId // Use inventory.createdBy
                ? t("you")
                : usersMap.get(inventory.createdBy)?.name ||
                  inventory.createdBy}{" "}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className="flex items-center gap-1 w-fit"
              >
                {inventory.public ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {inventory.public ? t("public") : t("private")}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {inventory.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {/* Determine and display the current user's role */}
              {currentUserId
                ? (() => {
                    const userAccess = accessList.find(
                      (a) =>
                        a.inventoryId === inventory.id &&
                        a.userId === currentUserId
                    );

                    if (userAccess) {
                      // Translate the role
                      return t(`role_${userAccess.role.toLowerCase()}`);
                    }

                    return inventory.public
                      ? t("role_public_viewer")
                      : t("role_no_access");
                  })()
                : inventory.public
                ? t("role_public_viewer")
                : t("role_no_access")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
