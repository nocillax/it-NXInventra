## The App’s Scope

Think of your app as divided into two major sections:

1. **Global Pages** — where users explore, manage, or access multiple inventories.
2. **Inventory Pages** — everything _inside_ one inventory (the tabs you’ve already built).

The **global pages** handle _who can access what_, while the **inventory pages** handle _what’s inside_ that inventory.

---

## 🧱 1️⃣ Global Pages (Outside Any Single Inventory)

| Page                           | Path                           | Description                                                                                                                               | Access          |
| ------------------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Login / Register**           | `/auth/login` `/auth/register` | Authentication via email or social login.                                                                                                 | Public          |
| **Dashboard / My Inventories** | `/inventories`                 | Shows two tables: “Inventories Owned” and “Inventories with Access”. Each row: title, category, description, role, actions.               | Logged-in users |
| **Public Inventories**         | `/explore`                     | Lists all public inventories (view-only). Includes filters by category, tags, search. Clicking opens the inventory view (read-only mode). | Public          |
| **Profile Settings**           | `/settings/profile`            | Edit user name, email, password, language preference, theme mode.                                                                         | Logged-in users |
| **Global Search Results**      | `/search`                      | Shows results for inventories/items that match the global search bar.                                                                     | Logged-in users |
| **Error / Empty Pages**        | `/404`, `/no-access`, `/empty` | Basic placeholders for missing data, restricted inventory, etc.                                                                           | Public/Private  |

---

### 🧭 Example “Dashboard / My Inventories” Page

- Table 1: _Inventories You Own_
- Table 2: _Inventories You Can Access_ (as Editor/Viewer)
- Each row has:

  - Inventory Title
  - Category
  - Description
  - Role (Owner/Editor/Viewer)
  - Actions → View / Edit / Delete

🧩 Clicking “View” opens the **Inventory Layout** with relevant tabs.
(You already built that part — you’ll just conditionally lock certain tabs based on the user’s role.)

---

## 🧱 2️⃣ Inventory Pages (Inside One Inventory)

These are the tabs you’ve been working on — now let’s map them clearly.

| Tab                | Path                           | Purpose                                                        | Who Can Access                |
| ------------------ | ------------------------------ | -------------------------------------------------------------- | ----------------------------- |
| **Items**          | `/inventories/[id]/items`      | Table of items with sorting, filtering, and actions.           | Viewer+                       |
| **Discussion**     | `/inventories/[id]/discussion` | Threaded comment section.                                      | Editor+ (Viewers = read-only) |
| **Custom Fields**  | `/inventories/[id]/fields`     | Manage fields (name, type, visibility).                        | Owner only                    |
| **Custom ID**      | `/inventories/[id]/custom-id`  | Define format for item IDs.                                    | Owner only                    |
| **Access Control** | `/inventories/[id]/access`     | Manage who can view/edit.                                      | Owner only                    |
| **Settings**       | `/inventories/[id]/settings`   | Edit inventory title, description, visibility, tags, category. | Owner only                    |
| **Statistics**     | `/inventories/[id]/statistics` | Charts and insights (auto or quantity-based).                  | Viewer+                       |

---

## 🔒 Access Rules Inside Inventory Tabs

| Role       | Permissions                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------- |
| **Owner**  | Full access to all tabs (can edit, delete, manage access).                                  |
| **Editor** | Can add/edit items, comment, view stats. Cannot access settings, fields, or access control. |
| **Viewer** | Read-only access to items, discussion (no posting), and statistics.                         |

You’ll basically reuse your **tab layout** and **route structure**,
and just hide or disable certain tabs depending on the user’s `role`.

---

## 💡 UI Flow Summary

1. **User logs in** → lands on `/inventories`
2. From there:

   - Click **“Create Inventory”** → goes to form
   - Click any row → opens `/inventories/[id]/items`

3. In that inventory:

   - They can navigate across **tabs** (Items, Discussion, etc.)
   - Tabs are shown or hidden depending on access level

4. From global nav:

   - They can go to **Explore** (see public inventories)
   - Or use the **Search Bar** to find inventories they have access to

---
