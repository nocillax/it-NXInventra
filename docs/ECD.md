```markdown
# Environment Config Document (ECD) — NXInventra

## Overview

This document defines all environment variables used across both **frontend** and **backend** projects for NXInventra.

---

## 1. Global Variables

| Variable   | Used In  | Description                     | Example                      |
| ---------- | -------- | ------------------------------- | ---------------------------- |
| `NODE_ENV` | Both     | Environment mode                | `development` / `production` |
| `USE_MOCK` | Frontend | Toggles between mock data & API | `1` or `0`                   |

---

## 2. Frontend (`/frontend/.env.local`)

| Variable                        | Description              | Example                                              |
| ------------------------------- | ------------------------ | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE`          | Base URL for API calls   | `https://nxinventra-backend.onrender.com/api`        |
| `USE_MOCK`                      | Whether to use mock data | `1` (local dev) / `0` (production)                   |
| `NEXT_PUBLIC_SOCKET_URL`        | Socket.io namespace      | `https://nxinventra-backend.onrender.com/discussion` |
| `NEXT_PUBLIC_APP_URL`           | Public app URL           | `https://nxinventra.vercel.app`                      |
| `NEXT_PUBLIC_I18N_DEFAULT_LANG` | Default language         | `en`                                                 |
| `NEXT_PUBLIC_SUPPORTED_LANGS`   | Comma-separated list     | `en,bn`                                              |

---

## 3. Backend (`/backend/.env`)

| Variable               | Description                      | Example                                               |
| ---------------------- | -------------------------------- | ----------------------------------------------------- |
| `PORT`                 | Server port                      | `8080`                                                |
| `DATABASE_URL`         | Postgres connection string       | `postgresql://user:pass@host:5432/nxinventra`         |
| `JWT_SECRET`           | Secret for signing JWT           | `supersecretkey123`                                   |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID           | `xxx.apps.googleusercontent.com`                      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret              | `yyy`                                                 |
| `GITHUB_CLIENT_ID`     | GitHub OAuth Client ID           | `gh_12345`                                            |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret              | `abc123`                                              |
| `FRONTEND_URL`         | CORS origin                      | `https://nxinventra.vercel.app`                       |
| `CORS_ORIGIN`          | Comma-separated allowed origins  | `https://nxinventra.vercel.app,http://localhost:3000` |
| `SOCKET_NAMESPACE`     | Namespace for discussion gateway | `/discussion`                                         |

---

## 4. Deployment Defaults

### Frontend (Vercel)

- Use automatic `.env.local` configuration in project settings.
- Set `NEXT_PUBLIC_API_BASE` to your backend Render URL.
- Ensure “Environment Variables” in Vercel match backend Render `.env`.

### Backend (Render)

- Add all required variables under **Environment → Environment Variables**.
- Make sure `CORS_ORIGIN` includes both localhost and your Vercel domain.
- Ensure `DATABASE_URL` is correctly set to Render’s Postgres add-on.

---

## 5. Example Combined .env Files

### `/frontend/.env.local`
```

NEXT_PUBLIC_API_BASE=[https://nxinventra-backend.onrender.com/api](https://nxinventra-backend.onrender.com/api)
NEXT_PUBLIC_SOCKET_URL=[https://nxinventra-backend.onrender.com/discussion](https://nxinventra-backend.onrender.com/discussion)
NEXT_PUBLIC_APP_URL=[https://nxinventra.vercel.app](https://nxinventra.vercel.app)
NEXT_PUBLIC_I18N_DEFAULT_LANG=en
NEXT_PUBLIC_SUPPORTED_LANGS=en,bn
USE_MOCK=1

```

### `/backend/.env`
```

PORT=8080
DATABASE_URL=postgresql://user:pass@host:5432/nxinventra
JWT_SECRET=supersecretkey123
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
FRONTEND_URL=[https://nxinventra.vercel.app](https://nxinventra.vercel.app)
CORS_ORIGIN=[https://nxinventra.vercel.app,http://localhost:3000](https://nxinventra.vercel.app,http://localhost:3000)
SOCKET_NAMESPACE=/discussion

```

---

## 6. Notes & Rules

✅ DO:
- Use `.env.local` for frontend dev, `.env` for backend.
- Keep **all OAuth keys and secrets private** (never commit).
- Use **HTTPS URLs** for both domains to avoid CORS + cookie issues.
- Always match backend `CORS_ORIGIN` to frontend base URL.

❌ DON’T:
- Hardcode fallback API URLs in frontend code.
- Store sensitive credentials in code.
- Push `.env` files to GitHub.

---

### ✅ End of ECD.md
```
