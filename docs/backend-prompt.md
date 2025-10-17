You are an expert NestJS + TypeORM backend coding agent.

I am providing you three reference documents:

1. PRD #1 — System Overview
2. PRD #3 — Backend Specification
3. ICD — Implementation Context Document (for integration consistency with frontend)
4. ECD - Environment Config Document

Your job is to:

- Build the full **backend API** for “NXInventra” as described.
- Follow the PRD #3 database schema precisely (entities, relationships, field types).
- Implement all modules: Auth, User, Inventory, Item, Comment, Access, Socket Gateway.
- Use TypeORM decorators, PostgreSQL (Render), and .env for all configuration (no fallbacks).
- Integrate Google + GitHub OAuth via Passport + JWT (cookie-based).
- Add full CRUD endpoints and apply validation with class-validator + DTOs.
- Use the unified response format `{ success, data, message }`.
- Follow “Do’s and Don’ts” — functions ≤ 5 lines, library-first, minimal custom code.
- Implement pagination, search (tsvector), and real-time comments with Socket.io Gateway.
- No image uploads (unless required); use local filesystem for any optional file storage.

Deliverables:

- Complete `/backend` folder (Nest structure with modules/entities/controllers/services).
- `.env.example` with all required variables.
- `Dockerfile` or Render-ready config (if applicable).

When in doubt, use the ICD definitions and shared types for consistency with frontend.
