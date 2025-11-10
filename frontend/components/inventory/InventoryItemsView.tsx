// "use client";

// import { useInventory } from "@/hooks/useInventory";
// import { useItems } from "@/hooks/useItems";
// import { useRbac } from "@/hooks/useRbac";
// import {
//   getCoreRowModel,
//   getSortedRowModel,
//   RowSelectionState,
//   SortingState,
//   useReactTable,
// } from "@tanstack/react-table";
// import { useTranslations } from "next-intl";
// import { useParams } from "next/navigation";
// import { useMemo, useState } from "react";
// import { getItemTableColumns } from "../item/ItemTableColumns";
// import { GenericError } from "../shared/GenericError";
// import { Skeleton } from "../ui/skeleton";
// import { ItemBulkActions } from "../item/ItemBulkActions";
// import { ScrollArea, ScrollBar } from "../ui/scroll-area";
// import { DataTable } from "../shared/DataTable";
// import { Pagination } from "../shared/Pagination";

// export default function InventoryItemsPage() {
//   const params = useParams();
//   const inventoryId = params.id as string;
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
//   const itemsPerPage = 10;

//   const {
//     inventory,
//     isLoading: isInventoryLoading,
//     error: inventoryError,
//   } = useInventory(inventoryId);
//   const {
//     items,
//     pagination,
//     isLoading: areItemsLoading,
//     error: itemsError,
//   } = useItems(inventoryId, { page: currentPage, limit: itemsPerPage });

//   const { canEdit } = useRbac(inventory);
//   const t = useTranslations("ItemsActions");

//   // Move table logic here
//   const columns = useMemo(
//     () => getItemTableColumns(inventory!, new Map(), canEdit),
//     [inventory, canEdit]
//   );

//   const table = useReactTable({
//     data: items || [],
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     onSortingChange: setSorting,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       rowSelection,
//       sorting,
//     },
//   });

//   const isLoading = isInventoryLoading || areItemsLoading;
//   const error = inventoryError || itemsError;

//   if (error) {
//     return <GenericError />;
//   }

//   if (isLoading || !inventory) {
//     return (
//       <div className="container mx-auto p-4">
//         <div className="space-y-4">
//           <Skeleton className="h-10 w-1/2" />
//           <Skeleton className="h-6 w-3/4" />
//           <div className="flex space-x-2">
//             <Skeleton className="h-10 w-20" />
//             <Skeleton className="h-10 w-20" />
//             <Skeleton className="h-10 w-20" />
//           </div>
//           <Skeleton className="h-64 w-full" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 space-y-6">
//       {/* Your existing header and toolbar would go here */}

//       <div className="space-y-4">
//         {canEdit && (
//           <ItemBulkActions
//             table={table}
//             inventoryId={inventory.id}
//             canEdit={canEdit}
//           />
//         )}

//         <ScrollArea className="w-full whitespace-nowrap rounded-md border">
//           <DataTable
//             table={table}
//             noResultsMessage={t("no_items")}
//             inventoryId={inventory.id}
//             entityType="item"
//           />
//           <ScrollBar orientation="horizontal" />
//         </ScrollArea>
//       </div>

//       {/* Pagination Controls */}
//       {pagination && pagination.totalPages > 1 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={pagination.totalPages}
//           onPageChange={setCurrentPage}
//         />
//       )}
//     </div>
//   );
// }
