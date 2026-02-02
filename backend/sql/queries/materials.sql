-- name: ListMaterials :many
SELECT id, type, title_ru, title_en, description_ru, description_en, file_url, file_size, mime_type, uploaded_by, created_at, updated_at
FROM materials
ORDER BY created_at DESC;

-- name: ListMaterialsByType :many
SELECT id, type, title_ru, title_en, description_ru, description_en, file_url, file_size, mime_type, uploaded_by, created_at, updated_at
FROM materials
WHERE type = $1
ORDER BY created_at DESC;

-- name: GetMaterial :one
SELECT id, type, title_ru, title_en, description_ru, description_en, file_url, file_size, mime_type, uploaded_by, created_at, updated_at
FROM materials
WHERE id = $1;

-- name: CreateMaterial :one
INSERT INTO materials (type, title_ru, title_en, description_ru, description_en, file_url, file_size, mime_type, uploaded_by)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, type, title_ru, title_en, description_ru, description_en, file_url, file_size, mime_type, uploaded_by, created_at, updated_at;

-- name: UpdateMaterial :one
UPDATE materials
SET type = $2, title_ru = $3, title_en = $4, description_ru = $5, description_en = $6, file_url = $7, file_size = $8, mime_type = $9, updated_at = now()
WHERE id = $1
RETURNING id, type, title_ru, title_en, description_ru, description_en, file_url, file_size, mime_type, uploaded_by, created_at, updated_at;

-- name: DeleteMaterial :exec
DELETE FROM materials
WHERE id = $1;
