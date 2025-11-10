// "use client";

// import * as React from "react";
// import { Inventory, User, Access } from "@/types/shared";
// import { useTranslations } from "next-intl";
// import { Skeleton } from "@/components/ui/skeleton";
// import { DataTable } from "@/components/shared/DataTable";
// import { getInventoryTableColumns } from "./InventoryTableColumns";
// import {
//   ColumnDef,
//   getCoreRowModel,
//   useReactTable,
//   SortingState,
//   getSortedRowModel,
// } from "@tanstack/react-table";

// interface InventoryTableProps {
//   inventories: Inventory[];
//   users: User[]; // To map ownerId to user name
//   accessList: Access[]; // To determine current user's role for each inventory
//   isLoading: boolean;
//   currentUserId: string; // To display "You" as owner
//   hideRoleColumn?: boolean;
// }

// interface InventoryTableProps {
//   inventories: Inventory[];
//   isLoading: boolean;
//   currentUserId: string;
//   hideRoleColumn?: boolean;
// }

// export function InventoryTable({
//   inventories,
//   isLoading,
//   currentUserId,
//   hideRoleColumn = false,
// }: InventoryTableProps) {
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const t = useTranslations("InventoryTable");

//   const columns = getInventoryTableColumns(
//     t,
//     new Map(),
//     [],
//     currentUserId,
//     hideRoleColumn
//   );

//   const table = useReactTable({
//     data: inventories || [],
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     onSortingChange: setSorting,
//     state: { sorting },
//   });

//   return (
//     <DataTable
//       table={table}
//       noResultsMessage={t("no_inventories")}
//       entityType="inventory"
//     />
//   );
// }
