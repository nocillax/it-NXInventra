// components/users/UserBulkActions.tsx - UPDATED LAYOUT
"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { User } from "@/types/shared";
import { Shield, ShieldOff, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/navigation";
import { toast } from "sonner";
import { userService } from "@/services/userService";

interface UserBulkActionsProps<TData> {
  table: Table<TData>;
}

export function UserBulkActions<TData>({ table }: UserBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const numSelected = selectedRows.length;
  const t = useTranslations("UsersActions");
  const { user: currentUser, logout } = useAuth();
  const router = useRouter();

  const selectedUsers = selectedRows.map((row) => row.original as User);

  // Check if current user is in selection
  const includesCurrentUser = selectedUsers.some(
    (user) => user.id === currentUser?.id
  );

  // Check admin status of selection
  const allAdmins = selectedUsers.every((user) => user.isAdmin);
  const allNonAdmins = selectedUsers.every((user) => !user.isAdmin);
  const mixedSelection = !allAdmins && !allNonAdmins;

  const handleToggleAdmin = async (makeAdmin: boolean) => {
    if (!numSelected) return;

    try {
      const userIds = selectedUsers.map((user) => user.id);
      await userService.bulkToggleAdmin(userIds, makeAdmin);

      toast.success(
        makeAdmin
          ? `${numSelected} users promoted to admin`
          : `${numSelected} users demoted from admin`
      );

      table.resetRowSelection();

      // If current user demoted themselves, logout and redirect
      if (includesCurrentUser && !makeAdmin) {
        toast.info("Your admin access has been removed");
        setTimeout(() => {
          logout();
          router.push("/");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update user roles");
    }
  };

  // In UserBulkActions.tsx - USE INDIVIDUAL DELETES
  const handleDelete = async () => {
    if (!numSelected) return;

    try {
      const userIds = selectedUsers.map((user) => user.id);

      // Same pattern as promote/demote - individual calls
      const deletePromises = userIds.map((userId) =>
        userService.deleteUser(userId)
      );
      await Promise.all(deletePromises);

      toast.success(`${numSelected} users deleted successfully`);
      table.resetRowSelection();

      if (includesCurrentUser) {
        toast.info("Your account has been deleted");
        setTimeout(() => {
          logout();
          router.push("/");
        }, 1000);
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete users");
    }
  };

  if (numSelected === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      {/* Left side: Action buttons */}
      <div className="flex items-center space-x-2">
        {/* Toggle Admin Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleAdmin(!allAdmins)}
          disabled={mixedSelection && !allAdmins}
        >
          {allAdmins ? (
            <ShieldOff className="h-4 w-4" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          <span className="ml-2">
            {allAdmins ? "Demote from Admin" : "Promote to Admin"}
            {mixedSelection && " (Mixed selection)"}
          </span>
        </Button>

        {/* Delete Button - Icon only */}
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right side: Selection info */}
      <div className="text-sm text-muted-foreground">
        {numSelected} user{numSelected > 1 ? "s" : ""} selected
        {includesCurrentUser && " (includes you)"}
      </div>
    </div>
  );
}
