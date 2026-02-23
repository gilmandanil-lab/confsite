-- +goose Up
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY document_type
      ORDER BY updated_at DESC, created_at DESC, id DESC
    ) AS rn
  FROM document_templates
)
DELETE FROM document_templates d
USING ranked r
WHERE d.id = r.id
  AND r.rn > 1;

ALTER TABLE document_templates
ADD CONSTRAINT document_templates_document_type_key UNIQUE (document_type);

-- +goose Down
ALTER TABLE document_templates
DROP CONSTRAINT IF EXISTS document_templates_document_type_key;
