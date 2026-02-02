-- +goose Up
INSERT INTO roles(code) VALUES
('USER'),('PARTICIPANT'),('ADMIN'),('SECTION_ADMIN')
ON CONFLICT DO NOTHING;

-- admin user: admin@confsite.local / Admin123!
INSERT INTO users(id,email,password_hash,email_verified,status)
VALUES (
  uuid_generate_v4(),
  'admin@confsite.local',
  '$2a$10$NaWDwvESpBtAEWlLDlfMe.eC0MKcOz43jyPuT5PjP4HdLIh7VW3kO',
  true,
  'APPROVED'
) ON CONFLICT (email) DO NOTHING;

WITH a AS (SELECT id FROM users WHERE email='admin@confsite.local'),
     r AS (SELECT id FROM roles WHERE code='ADMIN')
INSERT INTO user_roles(user_id,role_id,section_id)
SELECT a.id,r.id,uuid_nil() FROM a,r
ON CONFLICT DO NOTHING;

-- +goose Down
DELETE FROM user_roles WHERE role_id = (SELECT id FROM roles WHERE code='ADMIN');
DELETE FROM users WHERE email='admin@confsite.local';
DELETE FROM roles WHERE code IN ('USER','PARTICIPANT','ADMIN','SECTION_ADMIN');
