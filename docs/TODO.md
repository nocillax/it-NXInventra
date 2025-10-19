# NXInventra Frontend Development Plan

This document outlines the step-by-step tasks to build the NXInventra frontend. We will follow this checklist to ensure all features from the PRDs are implemented correctly.

---

### Phase 0: Project Setup & Configuration (Initial Step)

- [x] **Environment Setup:** Install Next.js, Tailwind, and all required npm packages.
- [x] **Shadcn/UI Init:** Configure `shadcn/ui` with the correct settings.
- [ ] **`package.json`:** Generate the initial `package.json` with project details and scripts.
- [ ] **Tailwind Config:** Configure `tailwind.config.js` to align with Shadcn and our design system.
- [ ] **Global Styles:** Clean up `globals.css` to only include necessary base styles.
- [ ] **Type Definitions:** Populate `/types/shared.ts` with all the core interfaces (User, Inventory, Item, etc.) from the ICD.
- [ ] **Root Layout:** Create the main `app/layout.tsx` with ThemeProvider, Toaster, and i18n setup.
- [ ] **API Client:** Implement the initial `apiClient.ts` and `mockApi.ts` in `/lib` to handle the `USE_MOCK` flag.

### Phase 1: Core Structure & Global Components

- [ ] **Zustand Stores:** Create the initial store files (`useUserStore`, `useModalStore`, `useInventoryStore`) in `/stores`.
- [ ] **SWR Hooks:** Create the files for all SWR hooks (`useInventories`, `useItems`, etc.) in `/hooks` with placeholder logic.
- [ ] **Shared Components:**
  - [ ] Build `ThemeToggle` in `/components/shared`.
  - [ ] Build `Avatar` in `/components/shared`.
  - [ ] Build `PageHeader` in `/components/shared`.
- [ ] **Main Header:** Implement the global header in `app/layout.tsx` containing the Logo, Search Bar placeholder, ThemeToggle, and User Avatar.

### Phase 2: Dashboard & Inventory List

- [ ] **Dashboard Page (`/app/page.tsx`):**
  - [ ] Implement `useInventories` hook to fetch data.
  - [ ] Build the "Latest Inventories" and "Top Inventories" sections using a simple card or table layout.
  - [ ] Build `TagCloud` component in `/components/shared` and add it to the dashboard.
- [ ] **Inventories List Page (`/app/inventories/page.tsx`):**
  - [ ] Build `InventoryToolbar.tsx` with a "Create Inventory" button.
  - [ ] Build `InventoryTable.tsx` to display the list of public inventories.
  - [ ] Connect the page to the `useInventories` hook.
  - [ ] Implement the "Create Inventory" modal using `useModalStore` and a Shadcn `Dialog`.

### Phase 3: Inventory Detail View (Tabs)

- [ ] **Inventory Layout (`/app/inventories/[id]/layout.tsx`):**
  - [ ] Implement the main tabbed layout using Shadcn `Tabs`.
  - [ ] Fetch inventory data using `useInventory(id)` hook.
  - [ ] Display the inventory title and description in the header.
- [ ] **Items Tab (`/items/page.tsx`):**
  - [ ] Build `ItemTable.tsx` to display items with dynamic columns from `inventory.customFields`.
  - [ ] Build `ItemBulkActions.tsx` for the table toolbar.
  - [ ] Implement `ItemEditDialog.tsx` for adding/editing items.
  - [ ] Connect the tab to the `useItems(inventoryId)` hook.
- [ ] **Discussion Tab (`/discussion/page.tsx`):**
  - [ ] Build `CommentList.tsx` and `CommentItem.tsx`.
  - [ ] Build `CommentForm.tsx` for posting new messages.
  - [ ] Connect to `useComments(inventoryId)` hook.
- [ ] **Settings Tab (`/settings/page.tsx`):**
  - [ ] Build the settings form for Title, Description, Tags, etc.
  - [ ] Implement auto-save logic on blur.
- [ ] **Custom Fields Tab (`/fields/page.tsx`):**
  - [ ] Build `FieldList.tsx` to display and manage custom fields.
  - [ ] Build `FieldEditorRow.tsx` for inline-like editing of fields.
  - [ ] (Optional) Add drag-and-drop reordering.
- [ ] **Custom ID Tab (`/custom-id/page.tsx`):**
  - [ ] Build `IDBuilder.tsx` to construct the ID format.
  - [ ] Build `IDPreview.tsx` to show a live example.
- [ ] **Access Tab (`/access/page.tsx`):**
  - [ ] Build `AccessList.tsx` to show users and roles.
  - [ ] Build `AccessInvite.tsx` to add new collaborators.
- [ ] **Statistics Tab (`/statistics/page.tsx`):**
  - [ ] Integrate `Recharts` to display simple charts (e.g., item counts).
  - [ ] Add `Card` components for key metrics.

### Phase 4: Final Polish & Integration

- [ ] **Global Search:** Implement the `SearchBar.tsx` logic with `useSearch` hook.
- [ ] **Internationalization (i18n):** Populate `locales` files and wrap all UI strings with the `t()` function.
- [ ] **Responsiveness:** Test and refine the layout for mobile and tablet views.
- [ ] **Final Review:** Go through all pages and components to ensure consistency and adherence to PRDs.

---
