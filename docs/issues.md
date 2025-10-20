💬 DISCUSSION TAB
🧠 Core Idea

The Discussion tab is a lightweight, per-inventory message board — basically a chat/forum for collaborators.

It’s there so users working on the same inventory (e.g., “Office Laptops”) can discuss things like:

“We should add more Dell units.”
“HP laptop overheating, maybe mark it for replacement.”

Each inventory has its own discussion thread, stored in the backend.

🧱 Data Model (from PRD #3)
Field Type Description
id uuid Unique message ID
inventoryId FK → Inventory Which inventory this discussion belongs to
userId FK → User The sender
message text Message content
createdAt timestamp Posted date/time
💬 Behavior Rules
Action Who Description
View messages All with access (Owner/Writer/Viewer) Sees live discussion thread
Post message Owner, Writer Can send new messages
Delete message Owner (for all) / Author (own) Optional, but can remove their own posts
Edit message Optional Not required by the project (you can skip)
⚡ Realtime / Socket

The PRD design assumes Socket.io (or similar WebSocket library) for real-time updates.

When a new message is posted → emit socket event → all connected clients update their thread.

🖥️ UI Layout (Next.js + Shadcn + Tailwind)

Header:
💬 Discussion for Inventory: Office Laptops

Chat Area:
Scrollable list of messages, most recent at bottom.
Each message bubble shows:

Avatar + name (left or right depending on user)

Message text

Timestamp (relative)

Input Area:
Text input + send button (bottom fixed).

📁 Mock Data Example
[
{
"id": "msg_1",
"inventoryId": "inv_computers",
"userId": "u_rahim",
"message": "We need to replace the HP laptop soon, it's overheating.",
"createdAt": "2025-03-12T10:45:00Z"
},
{
"id": "msg_2",
"inventoryId": "inv_computers",
"userId": "u_sadia",
"message": "Agreed. Let’s add it to the procurement list.",
"createdAt": "2025-03-13T08:25:00Z"
}
]

🎨 Design Notes

Use Shadcn ScrollArea, Avatar, Input, Button, and Card components.

Messages grouped by date (optional).

“All changes saved” not needed here.

Show placeholder if no messages yet.

For mock version, local state simulates socket updates.
