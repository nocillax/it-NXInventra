// app/[locale]/users/page.tsx - UPDATED
"use client";

import * as React from "react";
import {
  ColumnDef,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types/shared";
import { DataTable } from "@/components/shared/DataTable";
import { getUsersTableColumns } from "@/components/users/UsersTableColumns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { useUsers } from "@/hooks/useUsers";
import { UserBulkActions } from "@/components/users/UserBulkActions";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/navigation";
import { useEffect } from "react";

export default function UsersPage() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const t = useTranslations("UsersPage");
  const {
    user: currentUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter();

  const {
    users,
    total,
    isLoading: usersLoading,
    error,
  } = useUsers(pagination.pageIndex + 1, pagination.pageSize);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && !currentUser?.isAdmin) {
      router.push("/");
    }
  }, [isAuthenticated, currentUser, router, authLoading]);

  const isLoading = authLoading || usersLoading;

  const columns: ColumnDef<User>[] = React.useMemo(
    () =>
      getUsersTableColumns({
        currentUserId: currentUser?.id,
        canEdit: !!currentUser?.isAdmin,
      }),
    [currentUser]
  );

  const table = useReactTable({
    data: users,
    columns,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: {
      rowSelection,
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Show access denied for non-admins
  if (!isAuthenticated || !currentUser?.isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("access_denied")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">{t("load_error")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <UserBulkActions table={table} />

        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <DataTable table={table} noResultsMessage={t("no_users")} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
