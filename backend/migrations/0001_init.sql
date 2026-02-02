-- +goose Up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING','APPROVED','REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  section_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id, section_id)
);

CREATE TABLE email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  surname text NOT NULL,
  name text NOT NULL,
  patronymic text NOT NULL,
  birth_date date NOT NULL,
  city text NOT NULL,
  academic_degree text NULL,
  affiliation text NOT NULL,
  position text NOT NULL,
  phone text NOT NULL,
  postal_address text NOT NULL,
  consent_accepted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consent_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  storage_key text NOT NULL,
  filename text NOT NULL,
  mime text NOT NULL,
  size_bytes bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ru text NOT NULL,
  title_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE talks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  speaker_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_id uuid NULL REFERENCES sections(id) ON DELETE SET NULL,
  title text NOT NULL,
  affiliation text NOT NULL,
  abstract text NOT NULL CHECK (char_length(abstract) BETWEEN 250 AND 350),
  kind text NOT NULL CHECK (kind IN ('PLENARY','ORAL','POSTER')),
  authors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- +goose StatementBegin
CREATE OR REPLACE FUNCTION enforce_talk_limit() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (SELECT count(*) FROM talks WHERE speaker_user_id = NEW.speaker_user_id) >= 3 THEN
      RAISE EXCEPTION 'talk limit exceeded for speaker';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

CREATE TRIGGER trg_enforce_talk_limit
BEFORE INSERT ON talks
FOR EACH ROW EXECUTE FUNCTION enforce_talk_limit();

CREATE TABLE talk_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  talk_id uuid NOT NULL UNIQUE REFERENCES talks(id) ON DELETE CASCADE,
  storage_key text NOT NULL,
  filename text NOT NULL,
  mime text NOT NULL,
  size_bytes bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ru text NOT NULL,
  body_ru text NOT NULL,
  title_en text NOT NULL,
  body_en text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE page_contents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  title_ru text NOT NULL,
  body_ru text NOT NULL,
  title_en text NOT NULL,
  body_en text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE page_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id uuid NOT NULL REFERENCES page_contents(id) ON DELETE CASCADE,
  storage_key text NOT NULL,
  filename text NOT NULL,
  mime text NOT NULL,
  size_bytes bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  replaced_by uuid NULL REFERENCES refresh_sessions(id) ON DELETE SET NULL,
  revoked_at timestamptz NULL,
  expires_at timestamptz NOT NULL,
  user_agent text NULL,
  ip text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_sessions_user ON refresh_sessions(user_id);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id uuid NULL REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid NULL,
  before jsonb NULL,
  after jsonb NULL,
  ip text NULL,
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS refresh_sessions;
DROP TABLE IF EXISTS page_files;
DROP TABLE IF EXISTS page_contents;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS talk_files;
DROP TRIGGER IF EXISTS trg_enforce_talk_limit ON talks;
DROP FUNCTION IF EXISTS enforce_talk_limit;
DROP TABLE IF EXISTS talks;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS consent_files;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS email_verification_tokens;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

