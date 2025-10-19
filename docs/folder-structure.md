/frontend
├── /app
│ ├── layout.tsx
│ ├── page.tsx
│ ├── /inventories
│ │ └── page.tsx
│ ├── /[id]
│ │ ├── layout.tsx
│ │ ├── /items
│ │ │ └── page.tsx
│ │ ├── /discussion
│ │ │ └── page.tsx
│ │ ├── /settings
│ │ │ └── page.tsx
│ │ ├── /custom-id
│ │ │ └── page.tsx
│ │ ├── /fields
│ │ │ └── page.tsx
│ │ ├── /access
│ │ │ └── page.tsx
│ │ └── /statistics
│ │ └── page.tsx
│
├── /components
│ ├── /inventory
│ │ ├── InventoryTable.tsx
│ │ ├── InventoryCard.tsx
│ │ └── InventoryToolbar.tsx
│ ├── /item
│ │ ├── ItemTableRow.tsx
│ │ ├── ItemBulkActions.tsx
│ │ └── ItemEditDialog.tsx
│ ├── /discussion
│ │ ├── CommentList.tsx
│ │ ├── CommentForm.tsx
│ │ └── CommentItem.tsx
│ ├── /customId
│ │ ├── IDBuilder.tsx
│ │ └── IDPreview.tsx
│ ├── /fields
│ │ ├── FieldList.tsx
│ │ └── FieldEditorRow.tsx
│ ├── /access
│ │ ├── AccessList.tsx
│ │ └── AccessInvite.tsx
│ └── /shared
│ ├── PageHeader.tsx
│ ├── SearchBar.tsx
│ ├── TagCloud.tsx
│ ├── ThemeToggle.tsx
│ └── Avatar.tsx
│
├── /hooks
│ ├── useInventories.ts
│ ├── useInventory.ts
│ ├── useItems.ts
│ ├── useComments.ts
│ ├── useAuth.ts
│ └── useSearch.ts
│
├── /lib
│ ├── apiClient.ts
│ ├── mockApi.ts
│ └── formatters.ts
│
├── /mock
│ ├── users.json
│ ├── inventories.json
│ ├── items.json
│ └── comments.json
│
├── /stores
│ ├── useUserStore.ts
│ ├── useInventoryStore.ts
│ └── useModalStore.ts
│
├── /types
│ └── shared.ts
│
├── /locales
│ ├── /en
│ │ └── common.json
│ └── /bn
│ └── common.json
│
├── tailwind.config.js
└── package.json
