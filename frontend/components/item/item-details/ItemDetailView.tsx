// // components/item/item-details/ItemDetailView.tsx
// "use client";

// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Inventory } from "@/types/shared";
// import { ItemHeader } from "./ItemHeader";
// import { ItemFieldsSection } from "./ItemFieldsSection";

// interface ItemDetailViewProps {
//   item: {
//     id: string;
//     customId: string;
//     fields: Record<string, any>;
//   };
//   inventory?: Inventory;
//   inventoryId: string;
//   isEditing: boolean;
//   editedCustomId: string;
//   editedFields: Record<string, any>;
//   isSaving: boolean;
//   onEdit: () => void;
//   onCreate?: () => void;
//   onSave: () => void;
//   onCancel: () => void;
//   onCustomIdChange: (value: string) => void;
//   onFieldChange: (fieldTitle: string, value: any) => void;
// }

// export function ItemDetailView({
//   item,
//   inventory,
//   inventoryId,
//   isEditing,
//   editedCustomId,
//   editedFields,
//   isSaving,
//   onEdit,
//   onCreate,
//   onSave,
//   onCancel,
//   onCustomIdChange,
//   onFieldChange,
// }: ItemDetailViewProps) {
//   return (
//     <Card className="max-w-3xl mx-auto">
//       <CardHeader>
//         <ItemHeader
//           customId={isEditing ? editedCustomId : item.customId}
//           inventory={inventory}
//           inventoryId={inventoryId}
//           isEditing={isEditing}
//           isSaving={isSaving}
//           onEdit={onEdit}
//           onCreate={onCreate}
//           onSave={onSave}
//           onCancel={onCancel}
//           mode="edit"
//           // Remove onCustomIdChange from here
//         />
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <ItemFieldsSection
//           inventory={inventory}
//           itemFields={isEditing ? editedFields : item.fields}
//           isEditing={isEditing}
//           customId={isEditing ? editedCustomId : item.customId}
//           onCustomIdChange={onCustomIdChange}
//           onFieldChange={onFieldChange}
//           mode="edit"
//         />
//       </CardContent>
//     </Card>
//   );
// }
