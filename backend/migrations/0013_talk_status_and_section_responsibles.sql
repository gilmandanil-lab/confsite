-- +goose Up
ALTER TABLE talks
  ADD COLUMN status text NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING','APPROVED','REJECTED')),
  ADD COLUMN reviewed_at timestamptz NULL;

CREATE INDEX idx_talks_status ON talks(status);

CREATE TABLE section_responsibles (
  section_id uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (section_id, email)
);

CREATE UNIQUE INDEX uq_section_responsibles_lower_email ON section_responsibles(section_id, lower(email));

-- +goose Down
DROP TABLE IF EXISTS section_responsibles;

ALTER TABLE talks
  DROP COLUMN IF EXISTS reviewed_at,
  DROP COLUMN IF EXISTS status;
