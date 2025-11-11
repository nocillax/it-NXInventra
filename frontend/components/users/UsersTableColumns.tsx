// components/users/UsersTableColumns.tsx - FIXED
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldOff, Calendar } from "lucide-react";
import { format } from "date-fns";

interface UsersTableColumnsProps {
  currentUserId?: string;
  canEdit: boolean;
}

export const getUsersTableColumns = ({
  currentUserId,
  canEdit,
}: UsersTableColumnsProps): ColumnDef<User>[] => {
  const columns: ColumnDef<User>[] = [];

  if (canEdit) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <div className="ml-1 w-8">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="ml-1 w-8">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 32,
    });
  }

  columns.push(
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[180px]">
          {row.original.name}
          {currentUserId === row.original.id && (
            <span className="text-muted-foreground ml-1">(You)</span>
          )}
        </div>
      ),
      size: 200,
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => (
        <div className="truncate max-w-[220px]">{row.original.email}</div>
      ),
      size: 240,
    },
    {
      id: "provider",
      header: "Provider",
      accessorKey: "provider",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize truncate">
          {row.original.provider}
        </Badge>
      ),
      size: 120,
    },
    {
      id: "isAdmin",
      header: "Admin",
      accessorKey: "isAdmin",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isAdmin ? (
            <Shield className="h-4 w-4 text-green-600" />
          ) : (
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="truncate">
            {row.original.isAdmin ? "Admin" : "User"}
          </span>
        </div>
      ),
      size: 120,
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">
            {format(new Date(row.original.createdAt!), "MMM dd, yyyy")}
          </span>
        </div>
      ),
      size: 140,
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessorKey: "updatedAt",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">
            {format(new Date(row.original.updatedAt!), "MMM dd, yyyy")}
          </span>
        </div>
      ),
      size: 140,
    }
  );

  return columns;
};
