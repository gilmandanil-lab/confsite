-- +goose Up
CREATE TABLE document_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  document_type text NOT NULL CHECK (document_type IN ('CONSENT_DATA_PROCESSING', 'CONSENT_DATA_TRANSFER', 'LICENSE_AGREEMENT')),
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_templates_type ON document_templates(document_type);
CREATE INDEX idx_document_templates_active ON document_templates(is_active);

-- Table for users signing license agreements when uploading talks
CREATE TABLE signed_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  talk_id uuid REFERENCES talks(id) ON DELETE SET NULL,
  document_type text NOT NULL CHECK (document_type IN ('CONSENT_DATA_PROCESSING', 'CONSENT_DATA_TRANSFER', 'LICENSE_AGREEMENT')),
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, talk_id, document_type)
);

CREATE INDEX idx_signed_documents_user_id ON signed_documents(user_id);
CREATE INDEX idx_signed_documents_talk_id ON signed_documents(talk_id);
CREATE INDEX idx_signed_documents_type ON signed_documents(document_type);

-- +goose Down
DROP TABLE signed_documents;
DROP TABLE document_templates;
