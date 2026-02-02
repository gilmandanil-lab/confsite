-- +goose Up
CREATE TABLE IF NOT EXISTS email_verify_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verify_tokens_user_id ON email_verify_tokens(user_id);

-- +goose Down
DROP TABLE IF EXISTS email_verify_tokens;
