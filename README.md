# Confsite (RU/EN Conference site)

## Stack
- Backend: Go 1.22 + Gin, clean-ish layering (ports/services/adapters)
- DB: PostgreSQL
- SQL: sqlc + goose migrations
- Auth: email+password + email verification token
- Sessions/JWT: httpOnly cookies + refresh token rotation
- Storage: local (dev) / S3-compatible (prod, MinIO)
- Email: SMTP + RU/EN templates
- Frontend: React+TS+Vite+Tailwind, react-i18next

## Run (Docker)
```bash
docker compose up --build
Backend: http://localhost:8084

Frontend: http://localhost:5173

Migrations

Inside backend container (or locally):

cd backend
go install github.com/pressly/goose/v3/cmd/goose@latest
goose -dir ./migrations postgres "$DB_DSN" up

sqlc
cd backend
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
sqlc generate

Default admin

Seed creates:

admin@example.com
 / Admin12345! (change in seed)

API quick map

Public:

GET /api/public/pages/:slug

GET /api/public/news

GET /api/public/news/:id

GET /api/public/participants

GET /api/public/sections

Auth:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/refresh

POST /api/auth/logout

GET /api/auth/verify-email?token=...

Participant:

GET/PUT /api/participant/profile

GET/POST /api/participant/talks

GET/PUT/DELETE /api/participant/talks/:id

POST /api/participant/talks/:id/file (upload)

POST /api/files/consent (upload)

Admin:

GET /api/admin/users

PATCH /api/admin/users/:id/status

GET/POST /api/admin/sections

GET/POST/PUT/DELETE /api/admin/news

GET/PUT /api/admin/pages/:slug

GET /api/admin/pages

GET /api/admin/talks (optional filters)

GET /api/admin/audit

Exports:

GET /api/admin/exports/participants.csv

GET /api/admin/exports/participants.xlsx

GET /api/admin/exports/talks_by_section.xlsx
