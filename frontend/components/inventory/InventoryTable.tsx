"use client";

import * as React from "react";
import { Inventory, User, Access } from "@/types/shared";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/shared/DataTable";
import { getInventoryTableColumns } from "./InventoryTableColumns";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

interface InventoryTableProps {
  inventories: Inventory[];
  users: User[]; // To map ownerId to user name
  accessList: Access[]; // To determine current user's role for each inventory
  isLoading: boolean;
  currentUserId: string; // To display "You" as owner
  hideRoleColumn?: boolean;
}

export function InventoryTable({
  inventories,
  users,
  accessList, // Destructure accessList
  currentUserId,
}: InventoryTableProps) {
  const t = useTranslations("InventoryTable");
  const usersMap = React.useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  );

  const columns: ColumnDef<Inventory>[] = React.useMemo(
    () => getInventoryTableColumns(t, usersMap, accessList, currentUserId),
    [t, usersMap, accessList, currentUserId]
  );

  const table = useReactTable({
    data: inventories || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!inventories) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return <DataTable table={table} noResultsMessage={t("no_inventories")} />;
}
