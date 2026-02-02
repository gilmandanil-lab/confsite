-- +goose Up
-- Drop old consent_files table if it exists with old schema
DROP TABLE IF EXISTS consent_files CASCADE;

-- Create new consent_files table with proper schema
CREATE TABLE consent_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type text NOT NULL CHECK (consent_type IN ('DATA_PROCESSING', 'DATA_TRANSFER')),
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, consent_type)
);

CREATE INDEX idx_consent_files_user_id ON consent_files(user_id);
CREATE INDEX idx_consent_files_type ON consent_files(consent_type);
-- +goose Down
DROP TABLE IF EXISTS consent_files;
