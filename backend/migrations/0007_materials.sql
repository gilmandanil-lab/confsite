-- +goose Up
CREATE TABLE materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('ABSTRACT_TEMPLATE', 'LICENSE_AGREEMENT', 'PROCEEDINGS')),
  title_ru text NOT NULL,
  title_en text NOT NULL,
  description_ru text,
  description_en text,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_materials_type ON materials(type);

-- +goose Down
DROP INDEX IF EXISTS idx_materials_type;
DROP TABLE IF EXISTS materials;
