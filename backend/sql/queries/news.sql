-- name: ListNews :many
SELECT * FROM news ORDER BY pinned DESC, published_at DESC;

-- name: GetNews :one
SELECT * FROM news WHERE id = $1;

-- name: CreateNews :exec
INSERT INTO news (title_ru, body_ru, title_en, body_en, pinned)
VALUES ($1,$2,$3,$4,$5);
