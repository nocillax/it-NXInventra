You are an expert full stack coding agent skilled in Next.js 14 (App Router), TypeScript, TailwindCSS, Shadcn UI, SWR, and Zustand.

I am giving you four complete reference documents:

1. PRD #1 — System Overview
2. PRD #2 — Frontend Specification
3. PRD #3 — Backend Specification
4. ICD — Implementation Context Document (includes component mapping, hooks, workflows)
5. ECD - Environment Config Document

Your job is to:

- Build the entire **frontend** for the project "NXInventra" following these docs precisely.
- Use a **frontend-first approach**, utilizing **mock data** as described in the ICD and PRD #2.
- Structure the folders exactly as the ICD specifies (grouped by feature).
- Implement SWR hooks, Zustand stores, and Shadcn UI components accordingly.
- Follow all “Do’s and Don’ts” from PRDs (especially function size, library-first rule, and consistency).
- Use **TypeScript**, **Zod for form validation**, **next-themes for light/dark**, **next-i18next** for localization, and **Sonner** for toast notifications.
- Use the mock JSON files provided in `/mock` as data sources until backend is connected.
- Ensure that the app can toggle between mock data and API (using the `USE_MOCK` flag).

Deliverables:

- All source code files for `/frontend`, including `/components`, `/hooks`, `/lib`, `/stores`, `/mock`, `/types`.
- Realistic sample data (3–4 entries each).
- Example pages implemented: `Inventories`, `Items`, `Discussion`, `Custom Fields`, `Custom ID`, `Access`, `Statistics`.
- Follow Tailwind + Shadcn design consistency as mentioned in PRDs and ICD.

If anything is ambiguous, follow the **“library-first, least custom code possible”** rule.
