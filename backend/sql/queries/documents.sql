-- name: UpsertDocumentTemplate :exec
INSERT INTO document_templates (name, description, document_type, file_url, file_size, mime_type, version)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (document_type) DO UPDATE SET
  name = $1,
  description = $2,
  file_url = $4,
  file_size = $5,
  mime_type = $6,
  version = version + 1,
  updated_at = now();

-- name: GetDocumentTemplate :one
SELECT * FROM document_templates
WHERE document_type = $1 AND is_active = true
ORDER BY version DESC
LIMIT 1;

-- name: ListDocumentTemplates :many
SELECT * FROM document_templates
WHERE is_active = true
ORDER BY created_at DESC;

-- name: UpsertSignedDocument :exec
INSERT INTO signed_documents (user_id, talk_id, document_type, file_url, file_size, mime_type)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (user_id, talk_id, document_type) DO UPDATE SET
  file_url = $4,
  file_size = $5,
  mime_type = $6,
  uploaded_at = now();

-- name: GetSignedDocument :one
SELECT * FROM signed_documents
WHERE user_id = $1 AND talk_id = $2 AND document_type = $3;

-- name: GetUserSignedDocuments :many
SELECT * FROM signed_documents
WHERE user_id = $1
ORDER BY uploaded_at DESC;

-- name: GetTalkSignedDocuments :many
SELECT * FROM signed_documents
WHERE talk_id = $1
ORDER BY uploaded_at DESC;
