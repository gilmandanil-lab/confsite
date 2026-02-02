-- name: UpsertProfile :exec
INSERT INTO profiles (
  user_id, surname, name, patronymic, birth_date, city,
  academic_degree, affiliation, position, phone,
  postal_address, consent_data_processing, consent_data_transfer
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
)
ON CONFLICT (user_id) DO UPDATE SET
  surname = EXCLUDED.surname,
  name = EXCLUDED.name,
  patronymic = EXCLUDED.patronymic,
  birth_date = EXCLUDED.birth_date,
  city = EXCLUDED.city,
  academic_degree = EXCLUDED.academic_degree,
  affiliation = EXCLUDED.affiliation,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  postal_address = EXCLUDED.postal_address,
  consent_data_processing = EXCLUDED.consent_data_processing,
  consent_data_transfer = EXCLUDED.consent_data_transfer,  updated_at = now();

-- name: GetProfile :one
SELECT * FROM profiles WHERE user_id = $1;