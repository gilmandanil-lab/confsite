# Аналитика проекта Confsite

## 1. Краткое описание
Проект: двуязычная (RU/EN) платформа конференции с публичным сайтом, регистрацией участников, подачей докладов, загрузкой файлов и админской частью.

## 2. Структура репозитория
- `backend/` — Go API, миграции, SQL-запросы, шаблоны email.
- `frontend/` — React клиент (Vite + Tailwind).
- `docker-compose.yml` — Postgres/MinIO/MailHog/API/Web.
- `DESIGN_REDESIGN_SUMMARY.md`, `frontend/DESIGN_SYSTEM.md`, `frontend/REDESIGN_COMPLETE.txt` — дизайн-артефакты.
- `fix_migrations.py` — утилита для нормализации миграций.

## 3. Стек и зависимости
Backend:
- Go 1.23 (`backend/go.mod`), Gin, pgx/sqlc, JWT, validator, AWS S3 SDK, Excelize.
- SMTP для писем, RU/EN email-шаблоны (`backend/templates/email`).
Frontend:
- React 18 + TypeScript + Vite (`frontend/package.json`).
- TailwindCSS (+ typography), react-query, react-router, react-i18next, react-hook-form, zod.
Infra:
- PostgreSQL 16, MinIO, MailHog (`docker-compose.yml`).

## 4. Backend: архитектура и функции
### Архитектура
- Domain → Ports → Services → Adapters (`backend/internal`).
- Adapters: HTTP (Gin), DB (pgx/sqlc), Storage (local/S3), Mailer (SMTP).

### Основные сценарии
- Регистрация и верификация email, вход/refresh/logout.
- Профиль участника и доклады (лимит 3), загрузка согласия и файла доклада.
- Публичные страницы/новости/участники/программа.
- Админка: пользователи, секции, новости, страницы, доклады, аудит, экспорт.

### Безопасность/политики
- JWT в httpOnly cookie + refresh rotation.
- CORS allowlist + secure headers + rate limit + locale middleware.

## 5. API обзор (по роутеру)
Public:
- GET `/api/public/pages/:slug`
- GET `/api/public/news`
- GET `/api/public/news/:id`
- GET `/api/public/participants`
- GET `/api/public/sections`
- GET `/api/public/program`

Auth:
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`
- GET `/api/auth/verify-email`

User:
- GET `/api/me`

Participant:
- GET/PUT `/api/participant/profile`
- GET/POST `/api/participant/talks`
- GET/PUT/DELETE `/api/participant/talks/:id`
- POST `/api/participant/talks/:id/file`
- POST `/api/files/consent`
- POST `/api/registration/submit`

Admin (роль ADMIN):
- GET `/api/admin/users`
- PATCH `/api/admin/users/:id/status`
- GET/POST `/api/admin/sections`
- GET/POST/PUT/DELETE `/api/admin/news`
- GET `/api/admin/pages`
- PUT `/api/admin/pages/:slug`
- GET `/api/admin/talks`
- PUT `/api/admin/talks/:id`
- GET `/api/admin/audit`
- GET `/api/admin/exports/participants.csv`
- GET `/api/admin/exports/participants.xlsx`
- GET `/api/admin/exports/talks_by_section.xlsx`

## 6. БД: ключевые сущности и ограничения
(по `backend/migrations/*.sql` и `backend/sql/schemas/schema.sql`)
- `users`, `roles`, `user_roles` — учетные записи и роли.
- `profiles` — анкеты.
- `sections` — секции конференции.
- `talks` — доклады, ограничения: `abstract` 250–350 символов, `kind` (PLENARY/ORAL/POSTER), лимит 3 доклада на спикера (триггер).
- `news`, `page_contents` — контент CMS.
- `refresh_sessions` — refresh токены.
- `email_verification_tokens` / `email_verify_tokens` — токены подтверждения email.
- `audit_logs` — аудит.
- `consent_files`, `talk_files`, `page_files` — файлы (созданы в миграциях).

## 7. Frontend: архитектура и UX
- Роутинг: публичные страницы, кабинет участника, админ-панель (`frontend/src/app/router.tsx`).
- React Query для запросов и кэша, AuthProvider на основе `/api/me`.
- API клиент добавляет `?lang=ru|en` и делает auto-refresh при 401.
- i18n: RU/EN словари (`frontend/src/i18n`), LanguageSwitch + localStorage.
- ThemeSwitch (dark/light) через класс на `html`.
- UI-kit в `frontend/src/shared/ui`: Button, Card, Alert, Badge, Input, Grid, Hero и др.
- Tailwind-тема с бренд-палитрой и градиентами (`frontend/tailwind.config.ts`).

## 8. DevOps и конфиги
- Docker Compose: postgres(5436), minio(9000/9001), mailhog(1025/8025), api(8084), web(5173).
- `backend/.env` задает APP_URL/DB_DSN/JWT/SMTP/STORAGE/S3.

## 9. Метрики проекта (без `node_modules`)
- Всего файлов: 215
- Backend: 131 файла
- Frontend: 79 файлов
- По расширениям: `.go` 79, `.tsx` 49, `.sql` 16, `.html` 15, `.txt` 15, `.ts` 8, `.json` 7, `.md` 6, `.css` 3, `.env` 2, `.sh` 2, `.yml` 1

## 10. Замечания и несостыковки
1) README указывает Go 1.22, но `backend/go.mod` — Go 1.23 (`README.md`, `backend/go.mod`).
2) Дефолтный админ отличается: README vs seed в миграциях (`README.md`, `backend/migrations/0002_seed.sql`).
3) В `docker-compose.yml` используется `VITE_API_BASE`, но клиент читает `VITE_API_BASE_URL` (`docker-compose.yml`, `frontend/src/shared/api/client.ts`).
4) `backend/.env` использует `DB_DSN` с другими кредами, чем docker-compose/entrypoint (`backend/.env`, `docker-compose.yml`, `backend/entrypoint.sh`).
5) `backend/sql/schemas/schema.sql` не синхронизирован с миграциями (таблицы/колонки: `file_url`, `schedule_time`, `consent_files`, `talk_files`, `page_files`, `refresh_sessions`).
6) В `backend/sql/queries/talks.sql` есть обращение к `users.full_name/affiliation/city`, которых нет в схеме.
7) Для локального хранения формируется `STORAGE_PUBLIC_URL` с `/files`, но маршрута раздачи файлов в HTTP-роутере нет (`backend/internal/adapters/http/router.go`, `backend/.env`).
8) `OrganizerEmails` и `VerifyEmailTTL` не читаются из env, значения захардкожены в роутере (`backend/internal/adapters/http/router.go`).
9) Документация/строки содержат mojibake (битая кодировка) в ряде файлов (`frontend/DESIGN_SYSTEM.md`, `DESIGN_REDESIGN_SUMMARY.md`, `frontend/REDESIGN_COMPLETE.txt`, `frontend/src/shared/ComponentShowcase.tsx`, комментарии в `backend/internal`).
10) В репозитории присутствуют артефакты: `frontend/node_modules` и `backend/bin/api`.

## 11. Рекомендации (по приоритету)
- Свести `schema.sql` и миграции к единому источнику правды и пересгенерировать sqlc.
- Выровнять конфиги окружения (`DB_DSN`, `VITE_API_BASE_URL`) и README.
- Исправить кодировку дизайн- и README-файлов.
- Добавить раздачу локальных файлов (статик/прокси) либо настроить отдельный файловый сервис.
- Добавить базовые тесты (backend unit, frontend smoke).
