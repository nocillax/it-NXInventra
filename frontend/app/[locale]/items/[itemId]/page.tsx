// // app/inventories/[inventoryId]/items/[itemId]/page.tsx
// "use client";

// import { useParams } from "next/navigation";
// import { useItem } from "@/hooks/useItem";
// import { useInventory } from "@/hooks/useInventory";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Pencil, ArrowLeft } from "lucide-react";
// import Link from "next/link";
// import { useModalStore } from "@/stores/useModalStore";
// import { useTranslations } from "next-intl";

// export default function ItemDetailPage() {
//   const params = useParams();
//   const inventoryId = params.inventoryId as string;
//   const itemId = params.itemId as string;
//   const { item, isLoading } = useItem(itemId);
//   const { inventory } = useInventory(inventoryId);
//   const { onOpen } = useModalStore();
//   const t = useTranslations("ItemDetailPage");

//   if (isLoading) {
//     return (
//       <div className="container mx-auto p-6 space-y-4">
//         <Skeleton className="h-8 w-64" />
//         <Skeleton className="h-4 w-full" />
//         <Skeleton className="h-4 w-full" />
//         <Skeleton className="h-4 w-3/4" />
//       </div>
//     );
//   }

//   if (!item) {
//     return (
//       <div className="container mx-auto p-6">
//         <p>{t("not_found")}</p>
//       </div>
//     );
//   }

//   const handleEdit = () => {
//     onOpen("editItem", {
//       item,
//       inventoryId,
//     });
//   };

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <Link href={`/inventories/${inventoryId}/items`}>
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-3xl font-bold">{item.customId}</h1>
//             <p className="text-muted-foreground">
//               {/* {t("title", { inventory: inventory?.title })} */}
//               {inventory?.title}
//             </p>
//           </div>
//         </div>
//         <Button onClick={handleEdit}>
//           <Pencil className="mr-2 h-4 w-4" />
//           {t("edit_button")}
//         </Button>
//       </div>

//       {/* Item Fields */}
//       <div className="grid gap-6">
//         {inventory?.customFields
//           .sort((a, b) => a.orderIndex - b.orderIndex)
//           .map((field) => {
//             const value = item.fields?.[field.id.toString()];
//             return (
//               <div key={field.id} className="space-y-2">
//                 <h3 className="font-semibold">{field.title}</h3>
//                 <div className="p-4 bg-muted rounded-lg">
//                   {field.type === "boolean" ? (
//                     <span>{value ? t("yes") : t("no")}</span>
//                   ) : field.type === "link" && value ? (
//                     <a
//                       href={value as string}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline"
//                     >
//                       {value}
//                     </a>
//                   ) : (
//                     <span>{value ? String(value) : t("empty")}</span>
//                   )}
//                 </div>
//                 {field.description && (
//                   <p className="text-sm text-muted-foreground">
//                     {field.description}
//                   </p>
//                 )}
//               </div>
//             );
//           })}
//       </div>
//     </div>
//   );
// }

// Minimal test - remove all complex logic
export default function TestItemPage() {
  return (
    <div>
      <h1>Item Detail Page - IT WORKS!</h1>
      <p>If you see this, the route is working</p>
    </div>
  );
}
