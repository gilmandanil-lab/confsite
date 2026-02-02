-- name: GetPageBySlug :one
SELECT * FROM page_contents WHERE slug = $1;

-- name: UpsertPage :exec
INSERT INTO page_contents (slug, title_ru, body_ru, title_en, body_en)
VALUES ($1,$2,$3,$4,$5)
ON CONFLICT (slug) DO UPDATE SET
  title_ru = EXCLUDED.title_ru,
  body_ru = EXCLUDED.body_ru,
  title_en = EXCLUDED.title_en,
  body_en = EXCLUDED.body_en,
  updated_at = now();
