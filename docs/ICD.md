```markdown
# Implementation Context Document (ICD) — NXInventra

**Purpose:** Bridge the PRDs to actual frontend code. This is the document a coding agent or developer uses to _start coding the frontend_ with high confidence and minimal friction.

**Repo layout (monorepo):**
```

/frontend
/app
/components
/hooks
/lib
/mock
/stores
/styles
/types
/locales
next.config.js
package.json
/backend
(separate NestJS app)

```

---

## Summary of assumptions & rules (quick)
- **Frontend-first** development using realistic mock data.
- **SWR** for fetching (lighter code).
- **Grouped-by-feature** component structure.
- **Zustand** for global state (theme, auth, selected inventory, modals).
- **Shadcn/UI + TailwindCSS** for all UI — minimize custom UI code.
- Functions and hooks should be small and focused (≤ 5 lines where reasonable).
- Use an `apiClient` wrapper to centralize auth headers and error handling (minimal, small).
- JWT stored as HTTP-only cookie (backend is source of truth) — frontend will still use client-side logic for logged-in state detection.
- Mock toggle: optional `USE_MOCK` env flag — recommended during frontend-first iteration.

---

## 1 — Folder & file conventions (frontend)

```

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
│   ├── PageHeader.tsx
│   ├── SearchBar.tsx
│   ├── TagCloud.tsx
│   ├── ThemeToggle.tsx
│   └── Avatar.tsx
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

````

---

## 2 — Component mapping (feature grouped)
> Each entry lists: component name, path, props (important), data source (hook), and dependencies (Shadcn components to reuse).

### Inventory feature
- **InventoryTable** — `/components/inventory/InventoryTable.tsx`
  - Props: `inventories: Inventory[]`, `onSelect(id)`
  - Data: `useInventories()`
  - Uses: Shadcn `Table`, `DropdownMenu`, `Badge`
- **InventoryToolbar** — `/components/inventory/InventoryToolbar.tsx`
  - Props: `onCreate()`, `selectedIds[]`
  - Uses: Shadcn `Button`, `Input`, `Dialog`
- **InventoryCard** — `/components/inventory/InventoryCard.tsx` (small)
  - Props: `inventory`, used in dashboard grid (not default view, optional)

### Item feature
- **ItemTable** — `/components/item/ItemTable.tsx`
  - Props: `items`, `fieldsToShow[]`, `onBulkAction()`
  - Data: `useItems(inventoryId)`
  - Uses: Shadcn `Table`, `Checkbox`
- **ItemBulkActions** — `/components/item/ItemBulkActions.tsx`
  - Props: `selectedIds`
  - Uses: Shadcn `DropdownMenu`, `Button`
- **ItemEditDialog** — `/components/item/ItemEditDialog.tsx`
  - Props: `item?`, `onSave`
  - Uses: Shadcn `Dialog`, `Form` (react-hook-form)

### Discussion feature
- **CommentList** — `/components/discussion/CommentList.tsx`
  - Props: `comments`, `inventoryId`
  - Data: `useComments(inventoryId)` (SWR + socket subscription)
  - Uses: `ScrollArea`, `Avatar`, `Markdown` renderer
- **CommentForm** — `/components/discussion/CommentForm.tsx`
  - Props: `inventoryId`, `onPosted`
  - Uses: Shadcn `Textarea`, `Button`, react-hook-form

### Custom ID feature
- **IDBuilder** — `/components/customId/IDBuilder.tsx`
  - Props: `idFormat`, `onFormatChange`
  - UI: draggable list of elements (use `dnd-kit` or `react-beautiful-dnd`) but prefer minimal approach: reorder controls + preview
- **IDPreview** — `/components/customId/IDPreview.tsx`
  - Props: `format`, sample preview

### Custom Fields
- **FieldList** — `/components/fields/FieldList.tsx`
  - Props: `fields`, `onChangeField`
  - Uses: Shadcn `Table`, `Switch`, `DragHandle` (dnd optional)
- **FieldEditorRow** — `/components/fields/FieldEditorRow.tsx`
  - Props: `field`, `onSave`, `onDelete`

### Access
- **AccessList** — `/components/access/AccessList.tsx`
  - Props: `accessList`, `onUpdateRole`
  - Uses: Shadcn `Table`, `DropdownMenu`, `Dialog`
- **AccessInvite** — `/components/access/AccessInvite.tsx`
  - Props: `inventoryId`, `onInvite`
  - Uses: `Input`, `Select` (role), `Button`

### Shared components
- **SearchBar** — `/components/shared/SearchBar.tsx` (global top)
- **PageHeader** — `/components/shared/PageHeader.tsx`
- **ThemeToggle** — `/components/shared/ThemeToggle.tsx` (uses next-themes)
- **TagCloud** — `/components/shared/TagCloud.tsx`
- **Avatar** — `/components/shared/Avatar.tsx`
- **Toaster** — global provider configured in `layout.tsx` via Shadcn/Sonner

> **Note:** For any small UI building blocks (Button, Input, Dialog), *use Shadcn components directly* (do not reimplement).

---

## 3 — Hooks (SWR) mapping (exact names & endpoints)

> Hooks are lightweight wrappers around `swr` which call `apiClient`. Each returns `{ data, error, isLoading, mutate }`.

### `useInventories.ts`
- Path: `/hooks/useInventories.ts`
- Function: `export function useInventories(params?)`
- Calls:
  - `/api/inventories?page=&limit=&search=`
  - for mock: `/mock/inventories.json`
- Usage: Inventory listing, dashboard

### `useInventory.ts`
- Path: `/hooks/useInventory.ts`
- Function: `export function useInventory(id: string)`
- Calls:
  - `/api/inventories/:id`
  - for mock: `/mock/inventories.json` then `.find(i=>i.id===id)`

### `useItems.ts`
- Path: `/hooks/useItems.ts`
- Function: `export function useItems(inventoryId, params?)`
- Calls:
  - `/api/inventories/:id/items` (GET)
  - supports `?page=&limit=&search=`
  - for mock: `/mock/items.json`

### `useComments.ts`
- Path: `/hooks/useComments.ts`
- Function: `export function useComments(inventoryId)`
- Calls:
  - `/api/inventories/:id/comments`
  - uses Socket.io: subscribe to `new_message` for `inventoryId`

### `useAuth.ts`
- Path: `/hooks/useAuth.ts`
- Responsibilities:
  - Check `/auth/me` for current user
  - Expose `loginRedirect(provider)`, `logout()`
  - Keep user in Zustand store

### `useSearch.ts`
- Path: `/hooks/useSearch.ts`
- Calls:
  - `/api/search?q=...`
  - for mock: client-side filter over `/mock/inventories.json` and `/mock/items.json`

---

## 4 — API Client (minimal wrapper) `/lib/apiClient.ts`

Use a tiny wrapper to centralize headers & error handling. Example:

```ts
// apiClient.ts
export async function apiFetch(path: string, opts: RequestInit = {}) {
  const base = process.env.USE_MOCK === '1' ? '' : process.env.NEXT_PUBLIC_API_BASE;
  const res = await fetch(`${base}${path}`, {
    ...opts,
    credentials: 'include', // include cookies (HTTP-only JWT)
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }
  return res.json();
}
````

> Keep this file small. Use this with SWR fetcher: `const fetcher = (url) => apiFetch(url)`.

---

## 5 — Shared Types (`/types/shared.ts`) — minimal, authoritative

```ts
export type UUID = string;

export interface User {
  id: UUID;
  name: string;
  email: string;
  avatar?: string;
  provider?: "google" | "github";
}

export interface CustomField {
  id?: string;
  name: string;
  type: "text" | "number" | "boolean" | "url" | "longtext";
  showInTable?: boolean;
  validation?: string | null;
}

export interface Inventory {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  public: boolean;
  ownerId: string;
  idFormat?: string;
  customFields: CustomField[];
}

export interface Item {
  id: UUID; // internal primary key
  customId: string; // visible custom id
  inventoryId: string;
  fields: Record<string, any>;
  likes?: number;
  createdBy?: string;
  createdAt?: string;
}
```

> Keep these minimal. Frontend-first: these types mirror mock JSON. Backend DTOs will match (PRD3).

---

## 6 — Micro-workflows (action flows) — full, explicit

> Each flow is step-by-step so a coding agent knows exactly UI ↔ API ↔ state changes.

### 6.1 Create Inventory (modal)

1. User clicks **Create Inventory** → open modal (`InventoryToolbar` triggers useModalStore).
2. Form (react-hook-form + zod) validates `title` (min 3).
3. On submit -> call `apiFetch('/api/inventories', { method: 'POST', body: JSON.stringify(payload) })`.
4. On success -> `mutate('/api/inventories')` via SWR, show toast `Inventory created`, close modal.
5. Edge: if offline (mock), update local mock store & show toast.

### 6.2 Open Inventory Page

1. Route: `/inventories/[id]` -> `useInventory(id)` fetches inventory.
2. Layout loads Tabs — default to `Items` tab.
3. Items tab calls `useItems(id)` to populate table.
4. If user has write access -> enable `Add Item` button.

### 6.3 Add Item

1. Click `Add Item` -> open `ItemEditDialog` with fields auto-generated from `inventory.customFields`.
2. Form validates per field types (zod schema generated from customFields).
3. Submit -> POST `/api/inventories/:id/items`.
4. On success -> `mutate('/api/inventories/:id/items')` and show toast.

### 6.4 Edit Item

1. Click checkbox to select -> select then choose `Edit` (toolbar).
2. Edit opens `ItemEditDialog` with existing values.
3. Submit -> PUT `/api/items/:id`.
4. Backend uses optimistic locking version (PRD3) — if conflict -> show clear error toast.

### 6.5 Discussion Post

1. Type message -> submit -> POST `/api/inventories/:id/comments`.
2. Server pushes new message via Socket.io `new_message`.
3. `CommentList` reacts to Socket event: `on('new_message', msg => mutate('/api/inventories/:id/comments'))`.

### 6.6 Custom ID Edit

1. IDBuilder shows components, reorder elements -> modifies `idFormat`.
2. Save triggers PUT `/api/inventories/:id` with `idFormat`.
3. Preview only affects new items.

### 6.7 Change Access

1. Owner opens `Access` tab -> `AccessList` fetches `/api/inventories/:id/access`.
2. Invite by email -> POST `/api/inventories/:id/access` with `{email, role}`.
3. On success -> mutate and show toast.

### 6.8 Global Search

1. Typing in the header `SearchBar` triggers debounced query to `/api/search?q=...`.
2. Show dropdown preview from search results (inventories + items).
3. Click result -> navigate to resource.

---

## 7 — Loading / Error UX rules (how to display)

- **Loading lists/tables:** use Shadcn skeletons or spinner. (Table skeleton for Items).
- **Form submission:** show inline disabled button + spinner.
- **Errors:** global toast with `error.message` (Shadcn Toaster). If API returns structured `success:false` show that message.
- **Conflict on edit:** show modal with conflict text and buttons: `Reload`, `Overwrite` (only if allowed).

---

## 8 — Auth & JWT handling (frontend specifics)

**Flow summary**

- Backend provides OAuth endpoints.
- After OAuth, backend should set an HTTP-only cookie with JWT (or return token; we recommend cookie).
- Frontend `useAuth()` calls `/auth/me` to get user info (if cookie present). `apiFetch('/auth/me')`.

  - If success, store user in Zustand `useUserStore.setUser(user)`.
  - If 401, clear store.

**Implementation notes**

- `credentials: 'include'` in `apiFetch` allows cookie on cross-site if backend permits CORS.
- For front-end-only dev with mock, `useAuth` can seed a mock user.

---

## 9 — Mock mode & switching (USE_MOCK)

- If `process.env.USE_MOCK === '1'`, `apiClient` resolves to files under `/mock/*.json` and uses small client-side functions (mockApi.ts).
- Default: `USE_MOCK` off. Use only for local dev until backend is ready.

```ts
// mockApi.ts (very small)
export async function fetchMock(path: string) {
  const res = await fetch(`/mock${path}.json`);
  return res.json();
}
```

> **Recommendation:** Use `USE_MOCK` for frontend-first development. Remove toggles when switching to live API.

---

## 10 — Component & Hook templates (code snippets) — minimal, practical

### Example SWR hook (useInventories.ts)

```ts
import useSWR from "swr";
import { apiFetch } from "../lib/apiClient";

export function useInventories(query = "") {
  const url = `/api/inventories${query ? `?${query}` : ""}`;
  const { data, error, mutate } = useSWR(url, (p) => apiFetch(p));
  return { data, error, isLoading: !data && !error, mutate };
}
```

### Example small component (InventoryTable.tsx)

```tsx
import { Inventory } from "@/types/shared";
import { Table } from "@/components/shadcn";

export default function InventoryTable({
  inventories,
  onSelect,
}: {
  inventories: Inventory[];
  onSelect: (id: string) => void;
}) {
  return (
    <Table>
      {/* Table header */}
      <thead> ... </thead>
      <tbody>
        {inventories.map((inv) => (
          <tr key={inv.id} onClick={() => onSelect(inv.id)}>
            <td>{inv.title}</td>
            <td>{inv.ownerId}</td>
            <td>{inv.tags.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
```

> Keep components small and focused. Extract repeated logic to hooks or small helper in `lib/formatters.ts`.

---

## 11 — Small conventions & coding rules (enforced across frontend)

- **Naming:** PascalCase for components, camelCase for functions/vars, kebab-case for file names inside `app` routes if necessary.
- **CSS:** Tailwind utility classes only; use `clsx` and `tailwind-merge` to compose classes.
- **Functions:** prefer very small functions (≤ 5 lines) — when longer, split into helper functions.
- **Tests:** manual testing only (you said no Jest). Add comments where unit tests should go.
- **i18n keys:** keep flat for common strings (`common.create_inventory`) and use next-i18next keys in components.

---

## 12 — Full list of all components (summary list — include correct Shadcn names where applicable)

> Shadcn component names are paraphrased — use appropriate imports from your shadcn UI setup.

- `Button`
- `Input`
- `Textarea`
- `Table`
- `DropdownMenu`
- `Dialog`
- `Tabs`
- `Toast` (Sonner)
- `Avatar`
- `Badge`
- `Switch`
- `Select`
- `ScrollArea`
- `Card`
- `Form` (react-hook-form integration components)
- `Tooltip`
- `Skeleton`

Use these for buttons, dialogs, forms, etc. — don’t reinvent.

---

## 13 — Error-prone areas & defensive notes (so agent/dev avoids traps)

1. **Custom fields rendering:** generate zod schemas dynamically — validate both frontend & backend to avoid mismatches.
2. **Custom ID collisions:** custom ID format must be validated server-side. Frontend only previews; do not assume uniqueness.
3. **No action buttons in every table row:** keep actions in toolbar or via multi-select context menu (must follow PRD).
4. **Image uploads:** omitted (you said optional). If later required, follow PRD: direct-to-cloud approach (Cloudinary or S3), never store on server file system for final product.
5. **State source:** for the selected inventory & selected rows use Zustand. Avoid prop-drilling large state through pages.

---

## 14 — Deliverables this ICD provides (for coding agent)

- Folder/file mapping for the entire frontend.
- Full component list and which shadcn components to use.
- SWR hook mapping to endpoints & mock file mapping.
- Shared TypeScript types for DTOs and Entities.
- Full micro-workflows for every user action (create/edit/delete/comment/search).
- Example code snippets for patterns: small SWR hook & small component.
- Guidance for JWT handling, mock mode, and minimal `apiClient`.
- Do/Don’t list and defensive notes to avoid grading pitfalls.

---

## 15 — Final checklist before coding (quick)

- [ ] Create project scaffold with Next.js, Tailwind, shadcn, SWR, Zustand, next-themes, next-i18next.
- [ ] Add `/mock/*.json` from PRD #2.
- [ ] Implement `apiClient.ts` and SWR fetcher.
- [ ] Implement Zustand stores for user & inventory.
- [ ] Build pages and components per mapping (start with Inventory list and Inventory page).
- [ ] Wire up Discussion with Socket.io mock (or minimal polling) for early dev.
- [ ] Toggle to real API by setting `USE_MOCK=0` and `NEXT_PUBLIC_API_BASE` to Render URL.

---

## 16 — If you want, next step I can generate:

- A **scaffold generator script** (list of `mkdir` & `touch` commands and example `package.json` dependencies) so you can run it locally and get the exact folders/files created.
- Or I can generate a **starter template** for `/frontend` with a handful of files (layout, Inventory page, InventoryTable, useInventories hook, mock files) ready to paste.

Tell me if you want the scaffold generator or starter template; either is quick and I’ll produce it immediately.

---

### End of ICD.md
