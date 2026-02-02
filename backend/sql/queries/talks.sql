-- name: CreateTalk :exec
INSERT INTO talks (
  speaker_user_id, section_id, title,
  affiliation, abstract, kind, authors
) VALUES ($1,$2,$3,$4,$5,$6,$7);

-- name: UpdateTalkSchedule :exec
UPDATE talks 
SET section_id = $1, schedule_time = $2 
WHERE id = $3;

-- name: ListTalksBySpeaker :many
SELECT * FROM talks WHERE speaker_user_id = $1;

-- name: CountTalksBySpeaker :one
SELECT count(*) FROM talks WHERE speaker_user_id = $1;

-- name: ListTalksWithSections :many
SELECT t.id, t.speaker_user_id, t.section_id, t.title, t.affiliation, t.abstract, t.kind, t.authors, t.schedule_time, t.file_url, t.created_at, s.title_ru, s.title_en, p.surname, p.name, p.patronymic, p.city
FROM talks t
LEFT JOIN sections s ON s.id = t.section_id
LEFT JOIN profiles p ON p.user_id = t.speaker_user_id
ORDER BY COALESCE(t.schedule_time, t.created_at), s.sort_order;
