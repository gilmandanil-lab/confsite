-- name: CreateConsentFile :exec
INSERT INTO consent_files (user_id, consent_type, file_url, file_size, mime_type)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (user_id, consent_type) DO UPDATE SET
  file_url = EXCLUDED.file_url,
  file_size = EXCLUDED.file_size,
  mime_type = EXCLUDED.mime_type,
  uploaded_at = now();

-- name: GetConsentFile :one
SELECT id, user_id, consent_type, file_url, file_size, mime_type, uploaded_at
FROM consent_files
WHERE user_id = $1 AND consent_type = $2;

-- name: GetConsentFilesByUser :many
SELECT id, user_id, consent_type, file_url, file_size, mime_type, uploaded_at
FROM consent_files
WHERE user_id = $1
ORDER BY consent_type;

-- name: DeleteConsentFile :exec
DELETE FROM consent_files WHERE user_id = $1 AND consent_type = $2;
