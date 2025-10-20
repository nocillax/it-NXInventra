### 🧭 1️⃣ Language Toggle (Global)

Yes, it needs to sit in your global navbar and work across the whole app.

**How it works:** purely front-end.
No backend or DB layer at all.
You’ll use something like **`next-intl`** or **`next-translate`** (or even `react-i18next` if you prefer).

- You store two language JSON files, e.g.:

  ```
  /locales/en/common.json
  /locales/bn/common.json
  ```

- The toggle just switches a context variable (e.g. `locale`).
- Every string is fetched from the translation files.
- You can persist the chosen language via cookie or localStorage if you want the preference saved.

**So:** ✅ No backend. 100% frontend.

---

### 🔍 2️⃣ Global Search — Gemini Prompt

The project expects **a single, global search bar** visible from the navbar, which searches:

- inventory titles
- item names (inside inventories you have access to)
- tags and categories (for public inventories too)

You can explain it to Gemini like this:

---

#### 💡 Gemini Prompt — “Global Search Implementation”

> Implement a **global search bar** that’s always visible in the navigation bar and accessible from any page.
>
> When the user types and presses Enter:
>
> - Navigate to `/search?q=term`.
> - The results page shows two sections:
>
>   1. **Inventories** → all public inventories and private inventories the user has access to, whose _title, description, or tags_ match the term.
>   2. **Items** → all items (from those accessible inventories) whose _custom ID or any field value_ matches the term.
>
> Backend will expose two endpoints:
>
> - `/api/v1/search/inventories?q=...`
> - `/api/v1/search/items?q=...`
>
> Each returns paginated results.
> The frontend should use **SWR** for data fetching and show skeleton loaders.
>
> Results display in a grid or stacked list using Shadcn cards:
>
> - Inventory cards: title, category, tags, visibility.
> - Item cards: item ID, field summary, inventory link.
>
> Include a fallback message:
> _“No results found for ‘query’.”_
>
> Keep logic simple; this is not a fuzzy search, just a case-insensitive `LIKE` match.
> Use Tailwind + Shadcn components throughout.

---

### 👤 3️⃣ Avatars — What the Project Actually Requires

The guide says:

> “You may show user avatars or initials where appropriate.
> Image storage is not required unless explicitly needed.”

So you’re **not required** to upload real image files.
Having encircled initials like GitHub/Notion (e.g. “X” for Xarif) perfectly satisfies the requirement.

If you _wanted_ to support image avatars optionally:

- Use a **free cloud service** like **Cloudinary** or **ImgBB**.
- You’d upload via API, store only the URL in the DB.
- But again, **not mandatory** — initials alone are totally fine.

So: ✅ Encircled initials will do.
🚫 No image upload required.

---
