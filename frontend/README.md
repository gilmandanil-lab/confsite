# Frontend (React + Vite)

RU/EN client for the conference platform. Features: bilingual public pages (Markdown from CMS), news, participant list, registration with consent upload, personal cabinet with profile + talks (3 per speaker) + thesis upload, and admin console (users, sections, news, pages, talks, exports).

## Requirements
- Node 18+
- Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (e.g. `http://localhost:8084`).

## Scripts
- `npm install` — install deps (installs Tailwind + react-query + heroicons).
- `npm run dev` — start Vite dev server on `0.0.0.0:5173` (proxy cookies to API if needed).
- `npm run build` — production build.
- `npm run preview` — preview production build.

## Tech
- React 18 + TypeScript + Vite
- TailwindCSS (typography plugin), custom light/dark palette (gray + blue)
- React Router 6.26, React Query 5
- react-i18next with RU/EN dictionaries; language toggle writes `lang` query to API
- Forms: react-hook-form

## Structure
- `src/app` — providers (auth/theme), router, guards.
- `src/features` — public pages, auth, registration, participant cabinet, admin.
- `src/shared` — UI primitives (table, markdown), layout, API client, types.
- `src/styles` — Tailwind entry + tokens.

## Notes
- Auth uses httpOnly cookies from the Go API; `apiRequest` always sends `credentials: "include"` and auto-refreshes on 401.
- Language switch sets i18n and passes `?lang=ru|en` to every API call (backend `Locale` middleware).
- File uploads: consent (5 MB) and theses (10 MB) with MIME sniffing aligned to backend rules (PDF/DOC/DOCX).
- Talk rules: abstract 250–350 chars, at least one author (name + affiliation), max 3 talks per speaker (frontend + backend validation).
- Admin console gated by `ADMIN` role (`/admin/*`); exports download CSV/XLSX from API.
