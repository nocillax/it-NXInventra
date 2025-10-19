# PRD #1 — System Overview & Architecture

**Project Name:** NXInventra  
**Tagline:** Custom inventory builder for teams and individuals

---

## 1. Project Vision & Scope

NXInventra is a full-stack web application that lets users **create, customize, and share dynamic inventories**.  
Each inventory behaves as an independent, user-defined data structure with its own fields, ID-rules, and access controls.  
The goal: give both individuals and teams the ability to model any kind of collection — hardware, books, artworks, parts, etc. — without writing code.

### Objectives

- Allow users to design inventories visually.
- Keep all logic reusable, modular, and library-driven.
- Minimize custom code; prefer existing packages.
- Maintain a consistent, responsive, Vercel-like aesthetic.
- Support English + Bangla, light / dark modes.
- Deliver real-time collaboration (discussions, updates).

---

## 2. User Roles & Access Control

| Role                | Capabilities                                                          | Notes                           |
| ------------------- | --------------------------------------------------------------------- | ------------------------------- |
| **Guest**           | View public inventories/items.                                        | Read-only.                      |
| **Registered User** | Create inventories, add/edit items, comment, like.                    | Auth via Google/GitHub (OAuth). |
| **Owner**           | Full CRUD over their inventories, manage access, custom fields & IDs. | Can invite collaborators.       |
| **Writer**          | Add/edit items in inventories shared with write access.               | Cannot modify settings.         |
| **Admin**           | Platform-level moderation (manage users, delete inventories).         | System only.                    |

---

## 3. System Architecture Overview

### High-Level Flow

```

[User Browser]
↓
[Next.js Frontend (Vercel)]
↔ Mock/Live API Layer (using SWR)
↓
[NestJS Backend (Render)]
↔ [PostgreSQL (Render)]
↔ [Socket.io Server] for real-time discussion
↔ [Auth Providers (Google, GitHub)]

```

### Component Responsibilities

- **Next.js** – UI, routing, i18n, theming, componentization via Shadcn/Tailwind.
- **NestJS** – REST API endpoints, auth (JWT + OAuth), data validation (DTOs), business logic (modules/services).
- **PostgreSQL** – Relational storage of users, inventories, items, comments, roles.
- **Socket.io** – Live discussion & presence updates.
- **Render** – Free hosting for backend + DB.
- **Vercel** – Static + SSR hosting for frontend.

---

## 4. Core Features by Module / Tab

### 4.1 Items Tab

- Table view only (no gallery).
- Columns auto-generated from Custom Fields + system fields.
- Bulk actions with checkboxes.
- Inline edit modal for each item.
- Real-time updates on add/edit/delete.
- Search bar + filters.
- **Mock Data Structure:**
  ```json
  {
    "id": "LAP-2025-001",
    "inventoryId": "inv_office_laptops",
    "fields": {
      "Model": "Dell XPS 15",
      "Processor": "Intel i7",
      "RAM": "16 GB",
      "Webcam": true
    },
    "likes": 23,
    "createdBy": "user_12",
    "createdAt": "2025-03-14T10:22:00Z"
  }
  ```

### 4.2 Discussion Tab

- Real-time chat-like thread per inventory.
- Markdown-style comment input.
- Shows avatar, username, timestamp.
- Auto-scroll to new messages.
- Uses Socket.io for instant sync.

### 4.3 General Settings Tab

- Form for Title, Description, Category, Tags, Image (optional).
- Auto-save on blur.
- Public/private toggle.

### 4.4 Custom ID Tab

- Visual builder for item ID format.
- Components: static text, date, counter, random, GUID.
- Live preview updates on change.
- Example pattern: `LAP-{YEAR}-{COUNTER(3)}` → `LAP-2025-001`.

### 4.5 Custom Fields Tab

- Drag-and-drop ordering.
- Field types: text, number, boolean, URL, long text (3 each max per type).
- Toggle “Show in table”.
- Validation rules (optional regex, min/max).

### 4.6 Access Tab

- Lists users with roles: Owner / Writer / Viewer.
- Add by email / username.
- Remove button for each user.
- **Mock Example:**

  ```json
  [
    { "user": "rahim", "role": "Owner" },
    { "user": "sadia", "role": "Writer" },
    { "user": "tanvir", "role": "Viewer" }
  ]
  ```

### 4.7 Statistics Tab

- Charts using Recharts.
- Metrics: Total Items, Avg values (numeric fields), Top fields used.
- Auto-calculates on fetch.
- Download CSV option.

---

## 5. Data Model (Frontend Perspective)

### Entities

- **User** → id, name, email, avatar, authProvider
- **Inventory** → id, title, description, tags, category, public, ownerId, customFields[], idFormat
- **Item** → id, inventoryId, fields{}, likes[], createdBy
- **Comment** → id, inventoryId, userId, message, timestamp
- **Access** → inventoryId, userId, role

Each entity initially mocked via local JSON files or static API routes (`/mock/inventories.json` etc.) before backend integration.

---

## 6. Tech Stack Summary

| Layer        | Technology                     | Reason                         |
| ------------ | ------------------------------ | ------------------------------ |
| Frontend     | **Next.js 13+ (App Router)**   | Modern, SSR/SSG, Vercel native |
| Styling      | **TailwindCSS v3 + Shadcn/UI** | Component reuse, speed         |
| State Mgmt   | **Zustand**                    | Lightweight, boilerplate-free  |
| Fetching     | **SWR**                        | Cache + stale-while-revalidate |
| Theme        | **next-themes**                | Simple light/dark handling     |
| i18n         | **next-i18next**               | English + Bangla               |
| Backend      | **NestJS**                     | Modular, type-safe API         |
| Auth         | **NextAuth.js / Passport**     | Google + GitHub OAuth          |
| Database     | **PostgreSQL (Render)**        | Relational consistency         |
| Realtime     | **Socket.io**                  | Simple discussion sync         |
| ORM          | **Prisma / TypeORM**           | Declarative schema mapping     |
| Charts       | **Recharts**                   | Ready-made graphs              |
| File Storage | **Skip optional uploads**      | To reduce complexity           |

---

## 7. Design Principles (Do & Don’t)

### ✅ DOs

- Use existing libraries before writing custom code.
- Keep functions ≤ 5 lines where reasonable.
- Componentize everything in frontend.
- Maintain consistent font sizes, spacing, and color palette.
- Follow Vercel/Next design tone (soft shadows, rounded edges).
- Separate logic from UI (clean service + component pattern).
- Enforce type safety across TS interfaces.
- Keep frontend and backend communication via well-typed DTOs.
- Use mock data to guide DB schema later.
- Implement real-time features only where user-impactful (Discussion tab).

### ❌ DON’Ts

- Don’t hardcode field names or IDs.
- Don’t use inline styles except rare cases.
- Don’t create custom components when a Shadcn one exists.
- Don’t duplicate logic across components (use helpers/hooks).
- Don’t mix presentation and business logic.
- Don’t store uploads locally.
- Don’t bloat with non-free or complex services.

---

## 8. Development Roadmap

### Phase 1 — Frontend Mock Implementation

- Build UI for Inventories + Tabs with Shadcn.
- Use static mock JSON for data.
- Implement theme toggle, i18n, routing.
- Validate data flow and component communication.

### Phase 2 — Backend API & DB Schema

- Derive entities from mock data.
- Create NestJS modules: `auth`, `inventory`, `item`, `comment`, `access`.
- Integrate PostgreSQL via Prisma/TypeORM.
- Add auth (OAuth + JWT).

### Phase 3 — Integration & Realtime

- Connect frontend queries to live API.
- Introduce Socket.io for Discussion tab.
- Implement optimistic locking for item edits.

### Phase 4 — Testing & Deployment

- Unit + integration tests (Jest / React Testing Library).
- Deploy Frontend → Vercel, Backend → Render.
- Verify i18n, theme, auth, search, statistics.

---

## 9. Future Enhancements (Optional)

- Email/password auth + verification.
- PDF export of inventory stats.
- Field-level permissions.
- Activity log timeline.
- External API for public inventory sharing.

---

**End of PRD #1 — System Overview & Architecture**

```

```
