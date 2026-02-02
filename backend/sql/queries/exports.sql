-- name: ExportParticipants :many
SELECT
  p.surname || ' ' || p.name || ' ' || p.patronymic AS full_name,
  p.affiliation,
  p.city,
  u.email
FROM profiles p
JOIN users u ON u.id = p.user_id
WHERE u.status = 'APPROVED';

-- name: ExportTalks :many
SELECT
  t.title,
  t.kind,
  t.authors,
  t.abstract,
  s.title_ru AS section,
  p.surname || ' ' || p.name || ' ' || p.patronymic AS speaker
FROM talks t
JOIN profiles p ON p.user_id = t.speaker_user_id
LEFT JOIN sections s ON s.id = t.section_id;
