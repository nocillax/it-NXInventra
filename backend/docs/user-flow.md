### ✅ **Confirmed Role Logic (based on the project requirements and dump)**

#### 👤 Guest (unauthenticated)

- Can:
  - View all **public** inventories and their items.
  - Use **global search** and **tags** to browse.

- Cannot:
  - Create, edit, delete inventories or items.
  - Comment, like, or modify anything.
  - Access any private or shared inventory.

---

#### 👥 Authenticated Users

Each authenticated user has a **role per inventory**, defined in the `access` table.

##### 🧭 Owner

- Can:
  - **Full control** over their inventories.
  - Edit title, description, tags, custom fields, custom ID format, access list, statistics view, and category.
  - Add / edit / delete any item.
  - Delete the inventory itself.
  - Change roles of others (add/remove viewers or editors).
  - Change _their own role_, including removing their own ownership (resulting in possible orphaned inventory, which DB should later flag).

- Cannot:
  - Override admin users.

##### 🛠️ Editor

- Can:
  - Add, edit, and delete items in inventories they have access to.
  - Comment on discussions.

- Cannot:
  - Modify inventory settings (title, description, tags, fields, etc.).
  - Manage access list.
  - Delete the inventory.

##### 👁️ Viewer

- Can only:
  - View inventory and item details.
  - View comments.

- Cannot:
  - Add/edit/delete items, inventories, or comments.

---

#### 👑 Admin

- Has **global control**.
- Can:
  - View and modify **everything**, even if not assigned to that inventory.
  - Access every tab (like an Owner).
  - Manage users globally — view, block, unblock, promote/demote, or delete.
  - Remove or grant Admin privileges (even from themselves, as per requirement).

- Has a dedicated `/admin/users` page.
- Backend should bypass inventory-level role checks for Admins.

---

---

## ⚙️ **Super Detailed Gemini Prompt: Role Guards + User Flow Implementation**

You can paste this entire thing into Gemini — it’s written for backend-level clarity (NestJS + TypeORM assumed).

---

**Prompt for Gemini:**

> Refactor the backend access control layer to fully align with the required user roles and behaviors, as defined below.
> The system uses **NestJS**, **TypeORM**, and **JWT authentication**.
> Implement clean, maintainable role guards and access decorators.

---

### 1. **Role Hierarchy Definition**

> Create a `Role` enum in `/src/common/enums/role.enum.ts`:
>
> ```ts
> export enum Role {
>   Guest = 'Guest',
>   Viewer = 'Viewer',
>   Editor = 'Editor',
>   Owner = 'Owner',
>   Admin = 'Admin',
> }
> ```
>
> Role precedence (for access logic):
> `Admin > Owner > Editor > Viewer > Guest`
>
> Only Admin is a _global_ role — others are _inventory-scoped_ (defined in `access` table).

---

### 2. **Decorators and Guards**

> Implement the following:
>
> - `@Public()` — marks an endpoint as accessible by guests.
> - `@Roles(...roles: Role[])` — declares required roles for a route.
>
> Create a single unified guard:
> `/src/common/guards/roles.guard.ts`
>
> Logic:
>
> 1. If `@Public()` is present → allow immediately.
> 2. If user is `Admin` → allow everything.
> 3. Else, check if user has one of the required roles:
>    - Fetch from `Access` table (`userId`, `inventoryId`).
>    - Match against roles declared on the route.
>    - If no access found or role too low → throw `403 Forbidden`.
>
> 4. For routes that require inventory context (e.g., editing an item or field), use the `inventoryId` param from the URL.
>
> Example usage:
>
> ```ts
> @UseGuards(JwtAuthGuard, RolesGuard)
> @Roles(Role.Owner, Role.Editor)
> @Patch('/inventories/:inventoryId/items/:id')
> updateItem(...) {}
> ```
>
> The guard should automatically:
>
> - Allow Admins.
> - Check role mapping from DB for others.
> - Deny unauthenticated users (401) if the route isn’t `@Public`.

---

### 3. **Route Access Rules**

> Apply guards as follows:
>
> | Endpoint                      | Access                     | Roles         |
> | ----------------------------- | -------------------------- | ------------- |
> | `GET /inventories`            | Public                     | Guest+        |
> | `GET /inventories/:id`        | Public                     | Guest+        |
> | `POST /inventories`           | Authenticated              | Owner         |
> | `PATCH /inventories/:id`      | Authenticated              | Owner         |
> | `DELETE /inventories/:id`     | Authenticated              | Owner         |
> | `GET /inventories/:id/items`  | Public if public inventory | Viewer+       |
> | `POST /inventories/:id/items` | Authenticated              | Editor, Owner |
> | `PATCH /items/:id`            | Authenticated              | Editor, Owner |
> | `DELETE /items/:id`           | Authenticated              | Editor, Owner |
> | `GET /comments/:inventoryId`  | Public                     | Viewer+       |
> | `POST /comments`              | Authenticated              | Editor, Owner |
> | `GET /admin/users`            | Authenticated              | Admin         |
> | `PATCH /admin/users/:id/role` | Authenticated              | Admin         |
> | `DELETE /admin/users/:id`     | Authenticated              | Admin         |
>
> Guests (no JWT) can only access `GET` routes marked as `@Public()`.

---

### 4. **User Flow Summary**

> - **Guest Flow:**
>   - Access `/inventories`, `/items`, `/search` freely.
>   - Any edit/add/comment/like attempts → `401 Unauthorized`.
>   - Frontend should redirect to login when receiving 401.
>
> - **Authenticated User Flow:**
>   - When a user logs in, the JWT payload should include:
>     `{ id, name, email, role: 'Admin' | 'User' }`
>   - Inventory-level roles (Owner/Editor/Viewer) come from `access` table.
>
> - **Admin Flow:**
>   - Skip all role checks entirely.
>   - Access everything.
>   - Has dedicated `/admin` endpoints.
>
> - **RBAC Enforcement Locations:**
>   - Controller decorators define access requirements.
>   - Guard enforces rules dynamically.
>   - Services must receive `userId` from request context to verify ownership where needed.

---

### 5. **Backend Integration Changes**

> Update `/src/user/user.service.ts` to:
>
> - Include a method `getUserRoleForInventory(userId: string, inventoryId: string): Role`
> - If no record found, return `Guest` (or `Viewer` if inventory is public).
> - Always return `Admin` for admin users regardless of inventory.
>
> Update `/src/access/access.entity.ts` to:
>
> ```ts
> @Entity('access')
> export class Access {
>   @PrimaryGeneratedColumn('uuid')
>   id: string;
>
>   @Column()
>   userId: string;
>
>   @Column()
>   inventoryId: string;
>
>   @Column({ type: 'enum', enum: Role })
>   role: Role;
> }
> ```
>
> For public inventories:
>
> - Automatically grant implicit Viewer access to all authenticated users and guests.

---

### 6. **Optional (Recommended)**

> Add helper in backend utils:
>
> ```ts
> export function canEditInventory(userRole: Role) {
>   return [Role.Admin, Role.Owner, Role.Editor].includes(userRole);
> }
>
> export function canManageAccess(userRole: Role) {
>   return [Role.Admin, Role.Owner].includes(userRole);
> }
> ```
>
> Use these helpers inside services to simplify condition checks.

---

### 7. **Testing Scenarios**

> 1. Guest opens `/inventories` → works.
> 2. Guest tries `POST /inventories` → 401 Unauthorized.
> 3. Authenticated Editor adds item → success.
> 4. Authenticated Viewer tries `PATCH /item/:id` → 403 Forbidden.
> 5. Admin deletes any inventory → success.
> 6. Owner removes their own Owner access → allowed, may orphan inventory.
> 7. DB can later flag orphaned inventories (no owners).

---

### ✅ **Expected Outcome**

After applying this prompt:

- You’ll have **clean, centralized RBAC logic**.
- All role checks are enforced in one guard.
- Admins bypass everything.
- Guests browse freely.
- Owners, Editors, Viewers behave exactly as per project requirements.

---
