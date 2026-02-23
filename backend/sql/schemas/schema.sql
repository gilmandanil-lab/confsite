CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL CHECK (status IN ('WAITING','APPROVED','REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  section_id uuid NULL,
  PRIMARY KEY (user_id, role_id, section_id)
);

CREATE TABLE refresh_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  revoked_at timestamptz NULL,
  expires_at timestamptz NOT NULL,
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
  consent_data_processing boolean NOT NULL DEFAULT false,
  consent_data_transfer boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ru text NOT NULL,
  title_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE section_responsibles (
  section_id uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (section_id, email)
);

CREATE UNIQUE INDEX uq_section_responsibles_lower_email ON section_responsibles(section_id, lower(email));

CREATE TABLE talks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  speaker_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_id uuid REFERENCES sections(id),
  title text NOT NULL,
  affiliation text NOT NULL,
  abstract text NOT NULL CHECK (char_length(abstract) BETWEEN 250 AND 350),
  kind text NOT NULL CHECK (kind IN ('PLENARY','ORAL','POSTER')),
  authors jsonb NOT NULL,
  status text NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING','APPROVED','REJECTED')),
  reviewed_at timestamptz,
  schedule_time timestamptz,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ru text NOT NULL,
  body_ru text NOT NULL,
  title_en text NOT NULL,
  body_en text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now()
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

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE email_verify_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verify_tokens_user_id ON email_verify_tokens(user_id);

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
