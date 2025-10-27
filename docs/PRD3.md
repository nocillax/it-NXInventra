# PRD #3 — Backend Specification + Database & API Design

**Project:** NXInventra  
**Stack:** NestJS + TypeORM + PostgreSQL  
**Hosting:** Render (API + DB)  
**Approach:** Derived from frontend mock data structure (Frontend-first alignment)

---

## 1. Backend Overview

NXInventra’s backend powers a flexible, multi-tenant inventory system where each user can create and customize inventories with unique fields and ID structures.  
The system exposes a RESTful API consumed by the Next.js frontend.

### Primary Goals

- Mirror frontend mock data 1:1 in the database schema.
- Use modular NestJS architecture.
- Minimize custom code, use Nest generators and decorators as much as possible.
- Ensure scalable relational design (Inventory → Items → Fields → Comments).
- Serve consistent API responses and validation.

---

## 2. System Architecture

```

[Client (Next.js)]
↓ REST
[NestJS Backend (Render)]
├── Auth Module (Passport OAuth2 + JWT)
├── Inventory Module
├── Item Module
├── Comment Module
├── Access Module
├── User Module
└── Socket.io Gateway (Discussion)
↓
[PostgreSQL DB (Render)]

```

### Components

- **NestJS Modules:** Auth, User, Inventory, Item, Comment, Access.
- **TypeORM:** Entity-based schema management.
- **Socket.io Gateway:** Real-time message broadcast for discussions.
- **PostgreSQL:** Relational data + full-text search.
- **DTO + Validation:** class-validator + class-transformer for each request.

---

## 3. Folder Structure

```

/src
├── app.module.ts
├── main.ts
├── config/
│ └── ormconfig.ts
├── common/
│ ├── filters/
│ ├── interceptors/
│ ├── decorators/
│ └── pipes/
├── modules/
│ ├── auth/
│ │ ├── auth.controller.ts
│ │ ├── auth.service.ts
│ │ ├── auth.module.ts
│ │ ├── strategies/
│ │ │ ├── google.strategy.ts
│ │ │ └── github.strategy.ts
│ │ └── jwt.strategy.ts
│ ├── user/
│ ├── inventory/
│ ├── item/
│ ├── comment/
│ ├── access/
│ └── socket/
└── entities/
├── user.entity.ts
├── inventory.entity.ts
├── item.entity.ts
├── custom-field.entity.ts
├── comment.entity.ts
├── access.entity.ts
└── id-format.entity.ts

```

---

## 4. Database Schema

### Database Design

````
CASCADING DELETE RULES:

✅ Case A — User is the only Owner of that inventory

→ When the user is deleted, that inventory becomes orphaned.
You have two safe options:

Option 1 (recommended):

Delete the inventories too (cascade delete).
Because your guide explicitly said:
“In our case, since there are no explicit requirements, you can choose the option that's easiest for you to implement. Cascade deletion in DB is simplest.”

This is safe because no one else has ownership — deleting them leaves useless data behind anyway.

✅ Case B — The inventory has multiple Owners (Conditional Logic)

→ If any other Owner(s) exist in access.json with role = "Owner", don’t delete the inventory — only remove the deleted user’s access record.

That’s why your ON DELETE CASCADE rule will cascade through Access (not through Inventories).
Inventories should only cascade if no other owners remain.
However, SQL can’t “auto-detect that logic” — so you’ll just handle it in the backend service:

Pseudo logic:

```typescript
// In UserService.deleteUser()
const inventoriesOwned = await this.inventoryRepository.find({ where: { ownerId: userId } });
for (const inventory of inventoriesOwned) {
  // Check if other owners exist in the Access table for this inventory
  // If not, delete the inventory (which will cascade to items, comments, etc.)
  // If others exist, only delete the user's access record.
}
````

"When deleting a user, if they are the sole Owner of an inventory, the inventory and its related entities are cascade deleted. If multiple owners exist, only that user’s access record is deleted."

CATEGORIES TABLE

Categories are stored in a static lookup table (category_lookup).

- Columns: id (PK), name (string)
- Used only for reference; users cannot modify it. This table will be pre-populated with a seed script containing `["Electronics", "Furniture", "Office", "Miscellaneous"]`.
- A NULL category value represents 'Other'.
  Category = just a filterable label, not something users can manage.

⚙️ Think of it like this:

Your system comes with a few predefined categories:

Electronics
Furniture
Office
Miscellaneous (NULL = “Other”)

These live in a simple categories table in DB (so it’s normalized and can be filtered efficiently).

When a user creates an inventory, they pick one from that list.
They can’t add a new category.

You don’t need a new tab or a UI for it.
You just fetch categories for a dropdown when someone creates/edits an inventory.

🔍 And why have it as a lookup table?

Because it gives you:

Consistent naming (“Electronics”, not “Electronics” vs “electronics” vs “Elec.”)

Easier filtering for admins or dashboards (e.g., “Show all Electronics inventories”)

Extensibility later — new categories can be added directly via DB if needed

🔥 Important difference:

Global search ≠ Category lookup

Global search → full-text or fuzzy search across inventories/items/comments.

Category lookup → exact match filter on one field (category_id), no fuzzy logic.

"Categories are static lookup values used for filtering inventories. Users can select, but not create or edit categories. Category data is used solely for filtering and organization; it is not part of the global full-text search."

```

### Entity Relationship Diagram (Simplified Markdown View)

```

User ──< Inventory ──< Item
│ │ │
│ ├──< Comment
│ ├──< Access
│ ├──< CustomField
│ └──< CustomIdFormat

````

---

### 4.1 User

| Field      | Type         | Notes                |
| ---------- | ------------ | -------------------- |
| id         | UUID         | PK                   |
| name       | varchar(100) |                      |
| email      | varchar(150) | unique               |
| avatar     | varchar(255) | nullable             |
| provider   | varchar(50)  | 'google' or 'github' |
| created_at | timestamp    | default now()        |
| updated_at | timestamp    | auto-update.         |

---

### 4.2 Inventory

| Field       | Type         | Notes                       |
| ----------- | ------------ | --------------------------- |
| id          | UUID         | PK                          |
| title       | varchar(150) | required                    |
| description | text         | nullable                    |
| category    | varchar(100) |                             |
| tags        | text[]       |                             |
| public      | boolean      | default true                |
| owner_id    | UUID         | FK → User (users)           |
| id_format   | jsonb        | Array of ID segment objects |
| created_at  | timestamp    | default now()               |
| updated_at  | timestamp    | auto-update                 |

Full-text index on `title, description, tags`.

---

### 4.3 CustomField

Aggregations (e.g., averages, counts) are calculated dynamically based on numeric field types.
No validation is enforced on field names or semantics; users may create arbitrary fields.

| Field         | Type                                             | Notes          |
| ------------- | ------------------------------------------------ | -------------- |
| id            | UUID                                             | PK             |
| inventory_id  | UUID                                             | FK → Inventory |
| name          | varchar(50)                                      |                |
| type          | enum('text','number','boolean','url','longtext') |                |
| show_in_table | boolean                                          |                |
| validation    | text                                             | optional regex |

---

### 4.4 Item

| Field        | Type        | Notes                     |
| ------------ | ----------- | ------------------------- |
| id           | UUID        | PK, internal identifier   |
| custom_id    | varchar(50) | unique, user-facing ID    |
| inventory_id | UUID        | FK → Inventory            |
| fields       | JSONB       | dynamic field-value pairs |
| likes        | int         | default 0                 |
| created_by   | UUID        | FK → User                 |
| created_at   | timestamp   |                           |
| updated_at   | timestamp   | auto-update.              |

**Note:** The `custom_id` is generated exclusively by the backend during item creation based on the inventory's `id_format` rules to ensure uniqueness and format consistency.

Use `JSONB` for field values to keep flexible per-inventory schema.

---

### 4.5 Comment

| Field        | Type      | Notes          |
| ------------ | --------- | -------------- |
| id           | UUID      | PK             |
| inventory_id | UUID      | FK → Inventory |
| user_id      | UUID      | FK → User      |
| message      | text      |                |
| timestamp    | timestamp | default now()  |

---

### 4.6 Access

| Field        | Type                            | Notes          |
| ------------ | ------------------------------- | -------------- |
| id           | UUID                            | PK             |
| inventory_id | UUID                            | FK → Inventory |
| user_id      | UUID                            | FK → User      |
| role         | enum('Owner','Editor','Viewer') |                |

---

## 5. TypeORM Configuration

```ts
TypeOrmModule.forRoot({
  type: "postgres",
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  synchronize: true, // only in dev
  logging: false,
});
````

---

## 6. Authentication Flow

### OAuth + JWT Flow

1. User logs in via Google or GitHub (Passport Strategy).
2. Successful OAuth → backend creates/updates user in DB.
3. Backend issues signed JWT (`jsonwebtoken`) → returned to frontend.
4. Frontend stores JWT in HTTP-only cookie.
5. All protected routes require JWT bearer auth.

### Example JWT Payload

```json
{
  "sub": "u_01",
  "name": "Rahim",
  "provider": "google",
  "iat": 1710242200,
  "exp": 1710249400
}
```

---

## 7. API Endpoints

### Base URL

`https://api.nxinventra.render.com/api`

---

### 7.1 Auth

| Method | Endpoint         | Description               |
| ------ | ---------------- | ------------------------- |
| GET    | `/auth/google`   | Redirect to Google OAuth  |
| GET    | `/auth/github`   | Redirect to GitHub OAuth  |
| GET    | `/auth/callback` | Handle OAuth response     |
| GET    | `/auth/me`       | Returns current user info |

---

### 7.2 Inventories

| Method | Endpoint           | Description                                     |
| ------ | ------------------ | ----------------------------------------------- |
| GET    | `/inventories`     | List all public inventories (search + paginate) |
| GET    | `/inventories/:id` | Get single inventory with fields                |
| POST   | `/inventories`     | Create new inventory                            |
| PUT    | `/inventories/:id` | Update title/desc/category                      |
| DELETE | `/inventories/:id` | Delete (owner only)                             |

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "inv_office_laptops",
    "title": "Office Laptops",
    "public": true,
    "customFields": [...]
  }
}
```

---

### 7.3 Items

| Method | Endpoint                 | Description        |
| ------ | ------------------------ | ------------------ |
| GET    | `/inventories/:id/items` | List all items     |
| POST   | `/inventories/:id/items` | Create new item    |
| PUT    | `/items/:id`             | Update item fields |
| DELETE | `/items/:id`             | Delete item        |

Item IDs generated using IDFormat rules.

---

### 7.4 Comments

| Method | Endpoint                    | Description             |
| ------ | --------------------------- | ----------------------- |
| GET    | `/inventories/:id/comments` | Fetch comments          |
| POST   | `/inventories/:id/comments` | Add comment             |
| DELETE | `/comments/:id`             | Delete (owner or admin) |

---

### 7.5 Access

| Method | Endpoint                          | Description       |
| ------ | --------------------------------- | ----------------- |
| GET    | `/inventories/:id/access`         | List access roles |
| POST   | `/inventories/:id/access`         | Add collaborator  |
| DELETE | `/inventories/:id/access/:userId` | Remove user       |

---

### 7.6 Statistics

| Method | Endpoint                 | Description                                 |
| ------ | ------------------------ | ------------------------------------------- |
| GET    | `/inventories/:id/stats` | Aggregates counts, averages, and top fields |

---

## 8. Realtime (Socket.io Gateway)

- Namespace: `/discussion`
- Event: `message` → `{ inventoryId, userId, message }`
- Broadcast: `new_message` → all clients subscribed to `inventoryId`

---

## 9. Pagination & Query Options

All list endpoints support:
`?page=1&limit=10&search=laptop&sort=created_at:desc`

---

## 10. Standard Response Format

```json
{
  "success": true,
  "data": {...},
  "message": "optional message"
}
```

Errors:

```json
{
  "success": false,
  "message": "Invalid ID"
}
```

---

## 11. Validation (DTO Example)

```ts
export class CreateInventoryDto {
  @IsString()
  @Length(3, 150)
  title: string;

  @IsString()
  category: string;

  @IsBoolean()
  public: boolean;
}
```

---

## 12. Environment Configuration

`.env` example for Render:

```
PORT=8080
DATABASE_URL=postgresql://user:pass@host:5432/nxinventra
JWT_SECRET=supersecret
GOOGLE_CLIENT_ID=xxxx
GOOGLE_CLIENT_SECRET=xxxx
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx
```

No fallbacks — only `.env` required.

---

## 13. Logging & Error Handling

- Use Nest `Logger` service.
- Global Exception Filter returning unified response.
- Example:

  ```ts
  catch (error) {
    this.logger.error(error.message);
    throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
  }
  ```

---

## 14. Full-Text Search Setup

In migration or seed:

```sql
CREATE INDEX inventory_search_idx ON inventories USING gin(to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || array_to_string(tags, ' ')));
```

Query:

```sql
SELECT * FROM inventory
WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('laptop');
```

---

## 15. Socket.io Integration Example

```ts
@WebSocketGateway({ namespace: "/discussion", cors: true })
export class DiscussionGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage("message")
  handleMessage(@MessageBody() msg: any) {
    this.server.to(msg.inventoryId).emit("new_message", msg);
  }
}
```

---

## 16. Do & Don’t (Backend Specific)

### ✅ DOs

- Use TypeORM decorators for all relationships.
- Keep service methods ≤ 5 lines where possible.
- Reuse DTOs for validation and swagger (if needed).
- Centralize env config (no defaults in code).
- Use transactions for multi-table writes.

### ❌ DON’Ts

- Don’t write raw SQL except for search indexing.
- Don’t use local storage for images or heavy files.
- Don’t couple services (each module independent).
- Don’t hardcode IDs or credentials.
- Don’t use fallback environment variables.

---

## 17. Development Roadmap

### Phase 1 — Module Scaffolding

- Create Nest modules for all features.
- Add TypeORM entities & DTOs.

### Phase 2 — Auth Integration

- Implement Google + GitHub OAuth strategies.
- JWT issuance & guards.

### Phase 3 — CRUD Endpoints

- Inventories, Items, Comments, Access.
- Pagination & validation.

### Phase 4 — Realtime & Search

- Add Socket.io Gateway.
- Implement PostgreSQL full-text.

### Phase 5 — Deployment

- Render app deployment (Docker or Auto-build).
- Environment variable config.

---

**End of PRD #3 — Backend Specification + Database & API Design**
