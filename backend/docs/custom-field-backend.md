Perfect — this is the right moment to polish before backend coding actually starts.
We’ll keep this crisp, deeply detailed, and exactly phrased for **Gemini**, so you can just copy-paste each block.

---

## 🧱 **Prompt #1: Add Item Editing + Optimistic Locking**

> You already have working GET and POST routes for items, and a database schema with `inventory_id`, `custom_id`, and `fields` (or your extended version).
> This prompt will make Gemini modify your backend to:
>
> - Add full item editing (`PATCH /items/:id`)
> - Add optimistic locking with a `version` column
> - Ensure versioning applies only to user-editable data (not `created_at`, `created_by`, etc.)
> - Handle proper conflict detection and return error responses accordingly

---

**Prompt:**

> Modify the NestJS backend to fully support item editing with optimistic locking.
>
> 1. **Add a version column:**
>    - In the `Item` entity, add a `version` field of type integer with a default value of `1`.
>    - It should automatically increment by 1 every time an update happens.
>    - It should be included in the database migrations as `version INT DEFAULT 1 NOT NULL`.
>
> 2. **Implement the PATCH endpoint:**
>    - Endpoint: `PATCH /api/items/:id`
>    - Request body: all editable fields for that item.
>    - The request must also include the current version value of the item (`version` field from the GET response).
>    - On the backend, run an `UPDATE` query or ORM update with a `WHERE id = :id AND version = :oldVersion` condition.
>    - If the affected rows count = 0 (i.e., no record was updated because version didn’t match), return a `409 Conflict` error with a JSON response like:
>
>      ```json
>      {
>        "error": "ConflictError",
>        "message": "This item was modified by another user. Please refresh and try again."
>      }
>      ```
>
>    - If successful, increment the version and return the full updated item object.
>
> 3. **Frontend integration guidance:**
>    - The GET `/api/items/:id` response should always include the `version` field.
>    - When the frontend sends an update request, it should include the last known version.
>    - On conflict (409), the frontend should show a toast like “Item was modified by another user. Please reload.”
>
> 4. **Validation and Authorization:**
>    - Only allow editing if the user has write access (owner, editor, or admin).
>    - Use the same RBAC rules as item creation.
>
> 5. **Version field updates:**
>    - Ensure `version` updates only when editable content changes — not when likes or views change.
>    - This ensures item stats don’t trigger version conflicts.
>
> 6. **Testing:**
>    - Simulate two concurrent updates with different version values and confirm that one fails with HTTP 409.
>
> The goal: make the item editing experience transactional but without long-lived DB locks — purely through optimistic version checks.

---
