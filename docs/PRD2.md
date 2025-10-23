# PRD #2 — Frontend Specification + Mock Data Design

**Project:** NXInventra  
**Stack:** Next.js 13+ (App Router) | TailwindCSS v3 | Shadcn/UI | Zustand | SWR | next-themes | next-i18next  
**Approach:** Frontend-first with realistic mock data

---

## 1. Frontend Architecture Overview

```

/app
├── layout.tsx              → root layout, header, theme, i18n provider
├── page.tsx                → dashboard (latest/top inventories)
├── inventories/
│    ├── page.tsx           → list of all inventories
│    └── [id]/
│         ├── layout.tsx    → inventory tab layout (Tabs component)
│         ├── items/page.tsx
│         ├── discussion/page.tsx
│         ├── settings/page.tsx
│         ├── custom-id/page.tsx
│         ├── fields/page.tsx
│         ├── access/page.tsx
│         └── statistics/page.tsx
├── mock/                   → mock JSON data (inventories, items, users)
├── components/             → reusable UI components (Shadcn-based)
├── hooks/                  → custom hooks (small, isolated logic)
├── stores/                 → Zustand state files
├── lib/                    → utility functions (api mock, formatters)
├── locales/                → i18n files (en, bn)
├── styles/                 → global.css, tailwind.css
└── types/                  → TS interfaces for mock data

```

---

## 2. Libraries & Utilities

| Purpose       | Library                       | Notes                                                                       |
| ------------- | ----------------------------- | --------------------------------------------------------------------------- |
| Styling       | TailwindCSS v3                | Utility-first, fast styling                                                 |
| Class Merging | `clsx`, `tailwind-merge`      | Avoid duplicated/conflicting classes                                        |
| Formatting    | `prettier-plugin-tailwindcss` | Auto-sort Tailwind classes                                                  |
| Components    | Shadcn/UI                     | Table, Tabs, Dialog, Toast, Dropdown, Input, Button, Avatar, Chart, Tooltip |
| Forms         | react-hook-form + zod         | Validation, simple setup                                                    |
| State         | Zustand                       | Lightweight store; theme/user/modal states combined                         |
| Fetch         | SWR                           | API caching, loading states, revalidation                                   |
| Theme         | next-themes                   | Light/dark toggle                                                           |
| i18n          | next-i18next                  | English + Bangla                                                            |
| Charts        | Recharts                      | For Statistics tab                                                          |
| Notifications | Shadcn Toaster (via Sonner)   | Global toast system                                                         |

---

## 3. Global Layout & UX

### Header Bar

- Logo (NX) + Search input (global).
- Language switcher (en/bn).
- Theme toggle (light/dark).
- User avatar → profile dropdown (sign out, settings).

### Sidebar (Optional for wide screens)

- Quick links to Inventories, My Inventories, Create Inventory.

### Responsive Rules

- Mobile: collapsible tabs → dropdown.
- Desktop: fixed tab bar top.
- Consistent font scale from Shadcn defaults (Headers 2xl, body base).

---

## 4. Global Search

- **Scope:** All inventories and items titles + tags.
- **Behavior:** Debounced input (500 ms) with dropdown preview.
- **Mock Response Format:**
  ```json
  [
    {
      "type": "inventory",
      "title": "Office Laptops",
      "id": "inv_office_laptops"
    },
    {
      "type": "item",
      "title": "HP Elitebook",
      "inventory": "Office Laptops",
      "id": "LAP-2025-003"
    }
  ]
  ```

````

---

## 5. Key Pages & Components

### 5.1 Dashboard (`/`)

* Tables: Latest Inventories & Top Inventories.
* Tag cloud (Shadcn Badge components).

### 5.2 Inventory List (`/inventories`)

* Table view of all public inventories.
* Pagination (10 per page mock).
* “Create Inventory” button → dialog form.

### 5.3 Inventory Page (`/inventories/[id]`)

Tab structure (using Shadcn Tabs):

| Tab               | Purpose                            | Key Components                            |
| ----------------- | ---------------------------------- | ----------------------------------------- |
| **Items**         | Table of items for this inventory. | `Table`, `Dialog`, `DropdownMenu`         |
| **Discussion**    | Real-time chat for inventory.      | `ScrollArea`, `Textarea`, `Button`        |
| **Settings**      | General info form (auto-save).     | `Form`, `Input`, `Switch`                 |
| **Custom ID**     | ID builder UI.                     | `Card`, `Input`, `Select`, `PreviewPanel` |
| **Custom Fields** | Manage field definitions.          | `Table`, `Switch`, `DragHandle`           |
| **Access**        | Manage permissions.                | `Table`, `Dropdown`, `Button`             |
| **Statistics**    | Charts + summaries.                | `Recharts` + `Card`                       |

---

## 6. Zustand Stores

| Store               | Data                             | Example State                 |
| ------------------- | -------------------------------- | ----------------------------- |
| `useUserStore`      | user info, auth status           | `{ user, isLoggedIn }`        |
| `useThemeStore`     | theme override (if needed)       | `{ theme: "light" }`          |
| `useModalStore`     | dialog visibility                | `{ isOpen, modalType }`       |
| `useInventoryStore` | selected inventory, cached items | `{ currentInventory, items }` |

All stores are small (≤ 50 lines).

---

## 7. Mock Data Structure

### 7.1 Users (`/mock/users.json`)

```json
[
  {"id":"u_01","name":"Rahim","email":"rahim@gmail.com","avatar":"/avatars/1.png"},
  {"id":"u_02","name":"Sadia","email":"sadia@gmail.com","avatar":"/avatars/2.png"},
  {"id":"u_03","name":"Tanvir","email":"tanvir@gmail.com","avatar":"/avatars/3.png"}
]
```

### 7.2 Inventories (`/mock/inventories.json`)

```json
[
  {
    "id":"inv_office_laptops",
    "title":"Office Laptops",
    "description":"Tracks company laptops with specs and condition.",
    "tags":["hardware","office","electronics"],
    "category":"Electronics",
    "public":true,
    "createdBy":"u_01",
    "idFormat":[
      { "id": "seg1", "type": "fixed", "value": "LAP-" },
      { "id": "seg2", "type": "date", "format": "yyyy" },
      { "id": "seg3", "type": "fixed", "value": "-" },
      { "id": "seg4", "type": "sequence", "format": "D3" }
    ],
    "customFields":[
      {"id": "cf1", "name":"Model","type":"text","showInTable":true},
      {"id": "cf2", "name":"Processor","type":"text","showInTable":true},
      {"id": "cf3", "name":"RAM","type":"number","showInTable":true},
      {"id": "cf4", "name":"Webcam","type":"boolean","showInTable":false}
    ]
  },
  {
    "id":"inv_phones",
    "title":"Company Phones",
    "description":"Inventory of issued smartphones.",
    "tags":["mobile","assets"],
    "category":"Electronics",
    "public":true,
    "createdBy":"u_02",
    "idFormat": [],
    "customFields":[
      {"id": "cf5", "name":"Model","type":"text","showInTable":true},
      {"id": "cf6", "name":"Camera","type":"text","showInTable":true},
      {"id": "cf7", "name":"Battery","type":"number","showInTable":true}
    ]
  }
]
```

### 7.3 Items (`/mock/items.json`)

```json
[
  {
    "id":"LAP-2025-001",
    "inventoryId":"inv_office_laptops",
    "fields":{"Model":"Dell XPS 15","Processor":"i7","RAM":16,"Webcam":true},
    "likes":12,"createdBy":"u_01","createdAt":"2025-03-01T12:00:00Z"
  },
  {
    "id":"LAP-2025-002",
    "inventoryId":"inv_office_laptops",
    "fields":{"Model":"HP Elitebook","Processor":"i5","RAM":8,"Webcam":true},
    "likes":9,"createdBy":"u_02","createdAt":"2025-03-02T12:00:00Z"
  },
  {
    "id":"PHN-2025-001",
    "inventoryId":"inv_phones",
    "fields":{"Model":"Samsung S23","Camera":"108 MP","Battery":4500},
    "likes":15,"createdBy":"u_03","createdAt":"2025-03-10T12:00:00Z"
  }
]
```

### 7.4 Comments (`/mock/comments.json`)

```json
[
  {
    "id":"c_001",
    "inventoryId":"inv_office_laptops",
    "userId":"u_02",
    "message":"Please update RAM details for Dell XPS.",
    "timestamp":"2025-03-04T10:00:00Z"
  },
  {
    "id":"c_002",
    "inventoryId":"inv_phones",
    "userId":"u_01",
    "message":"Camera specs look outdated, please verify.",
    "timestamp":"2025-03-12T09:00:00Z"
  }
]
```

---

## 8. Mock API Simulation

### Directory `/lib/api.ts`

```ts
export async function fetchInventories() {
  const res = await fetch("/mock/inventories.json");
  return res.json();
}
export async function fetchInventory(id: string) {
  const res = await fetch(`/mock/inventories.json`);
  const all = await res.json();
  return all.find((i: any) => i.id === id);
}
export async function fetchItems(invId: string) {
  const res = await fetch("/mock/items.json");
  const data = await res.json();
  return data.filter((x: any) => x.inventoryId === invId);
}
```

Later replaced with real API endpoints (`/api/inventories`, etc.).

---

## 9. Pagination & Scrolling

* Default pagination component from Shadcn.
* For Items tab only → optional infinite scroll using SWR's `useSWRInfinite`.
* Others use simple page-based mock pagination.

---

## 10. Validation & Forms

* `react-hook-form` handles inputs.
* `zod` schemas for field validation.
* Example:

  ```ts
  const inventorySchema = z.object({
    title: z.string().min(3),
    category: z.string(),
    public: z.boolean(),
  });
  ```

---

## 11. Toast System

* Global provider mounted in `layout.tsx`.
* Success/error notifications for mock actions.

---

## 12. Charts in Statistics Tab

* Uses Recharts with mock data from items.
* Example metrics: item count per inventory, average numeric field.
* Example:

  ```json
  [
    {"name":"Office Laptops","count":2},
    {"name":"Company Phones","count":1}
  ]
  ```

---

## 13. Internationalization Setup

### Directory

```
/locales/en/common.json
/locales/bn/common.json
```

### Sample Keys

```json
{
  "app_title":"NXInventra",
  "create_inventory":"Create Inventory",
  "items":"Items",
  "discussion":"Discussion",
  "settings":"Settings",
  "custom_id":"Custom ID",
  "custom_fields":"Custom Fields",
  "access":"Access",
  "statistics":"Statistics"
}
```

---

## 14. Do & Don’t (Frontend Specific)

### ✅ DOs

* Use existing Shadcn components for all UI.
* Keep functions ≤ 5 lines where possible.
* Componentize each feature (tab = separate component).
* Follow consistent font sizes and spacing.
* Use mock data as truth source for API design later.
* Keep hooks pure and stateless where possible.

### ❌ DON’Ts

* Don’t hardcode data — always map from mock JSON.
* Don’t introduce custom styles beyond Tailwind.
* Don’t create duplicate components.
* Don’t store theme or language in DB for now.
* Don’t mix SWR and manual fetch in same component without a good reason.

---

## 15. Integration Plan (Frontend → Backend)

| Frontend Mock API        | Future Backend Endpoint         | Expected Method           |
| ------------------------ | ------------------------------- | ------------------------- |
| `/mock/inventories.json` | `/api/inventories`              | GET / POST                |
| `/mock/items.json`       | `/api/inventories/:id/items`    | GET / POST / PUT / DELETE |
| `/mock/comments.json`    | `/api/inventories/:id/comments` | GET / POST                |
| `/mock/users.json`       | `/api/users`                    | GET                       |
| `/mock/access.json`      | `/api/inventories/:id/access`   | GET / POST / DELETE       |

---

## 16. Development Checklist

* [ ] Install Next.js + Tailwind + Shadcn.
* [ ] Add Zustand and SWR.
* [ ] Setup theme + i18n providers.
* [ ] Add mock JSON files and connect via API hooks.
* [ ] Build each tab component with Shadcn elements.
* [ ] Implement global search + toaster.
* [ ] Test responsiveness and theme switch.

---

**End of PRD #2 — Frontend Specification + Mock Data Design**
````
