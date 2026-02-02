-- name: ListSections :many
SELECT * FROM sections ORDER BY sort_order;

-- name: CreateSection :exec
INSERT INTO sections (title_ru, title_en, sort_order)
VALUES ($1, $2, $3);
