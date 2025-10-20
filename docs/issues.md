🧩 What Is a Custom ID?

A Custom ID is a concatenation of multiple ordered segments.
Each segment contributes part of the final ID string (e.g., prefix, sequence number, random value, or date).

Example of generated ID:

📦-A7E3A-013-2025

Example of user-defined format:

Type Format Example Output
Fixed 📦- 📦-
Random (Hex 5 digits) X5* A7E3A
Sequence (3 digits, padded) D3* 013
Date (year) yyyy 2025

Combined → 📦-A7E3A-013-2025

⚙️ Segment Types (all must be supported)
Type Description User Control Example
Fixed Static text added literally. Can contain emoji or symbols. Text input (e.g., “INV-” or “📦-”) 📦-
Sequence Auto-incrementing number per inventory. Can have padding (e.g. 3 digits = D3). Dropdown: D2–D6 001, 002, 003
Random Random numeric (D6) or hexadecimal (X5) value. Dropdown: D# or X# A7E3A, 042913
Date/Time Injects date/time tokens from when the item is created. Dropdown: yyyy, yy, MM, dd, DDD 2025, 25, 10, Mon
Custom Field (optional) Pulls a value from one of the item’s custom fields. Dropdown of custom fields (from inventory.fields[]) {Brand} → Dell
🧮 Formatting Rules

The final ID = concatenation of all segment outputs in order.

Segment order is drag-and-drop sortable.

Each segment is displayed as a row with:

Handle icon (drag)

Dropdown (select type)

Input field (format/value)

Help / delete icons

User can add new segment → “Add element” button.

Example of generated ID shown live at the top (e.g., “Example: 📦-A7E3A-013-2025”).

Each inventory stores its format as JSON array of segments:

[
{ "type": "fixed", "format": "📦-" },
{ "type": "random", "format": "X5" },
{ "type": "sequence", "format": "D3" },
{ "type": "date", "format": "yyyy" }
]

Example Layout
New Inventory 1
[ All changes saved ]
───────────────────────────────
Tabs: Items | Chat | Settings | Custom ID | Fields | Access | Stats | Export
───────────────────────────────
Example: 📦-A7E3A-013-2025
───────────────────────────────
[⇅] [Select Type: Fixed] [Input: 📦-] [InfoIcon] [TrashIcon]
[⇅] [Select Type: Random] [Input: X5_] [InfoIcon] [TrashIcon]
[⇅] [Select Type: Sequence] [Input: D3_] [InfoIcon] [TrashIcon]
[⇅] [Select Type: Date] [Input: yyyy] [InfoIcon] [TrashIcon]

[ + Add element ]
