package repos

import (
	"context"
	"time"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TalksRepo struct {
	q  *sqlc.Queries
	db *pgxpool.Pool
}

func NewTalksRepo(db *pgxpool.Pool) *TalksRepo {
	return &TalksRepo{q: sqlc.New(db), db: db}
}

func (r *TalksRepo) Create(ctx context.Context, t domain.Talk) (uuid.UUID, error) {
	id := uuid.New()
	_, err := r.db.Exec(ctx, `
INSERT INTO talks (id, speaker_user_id, section_id, title, affiliation, abstract, kind, authors, file_url)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		id, t.SpeakerUserID, t.SectionID, t.Title, t.Affiliation, t.Abstract, string(t.Kind), t.AuthorsJSON, t.FileURL)
	return id, err
}

func (r *TalksRepo) Update(ctx context.Context, t domain.Talk) error {
	_, err := r.db.Exec(ctx, `
UPDATE talks
SET section_id=$2, title=$3, affiliation=$4, abstract=$5, kind=$6, authors=$7
WHERE id=$1`,
		t.ID, t.SectionID, t.Title, t.Affiliation, t.Abstract, string(t.Kind), t.AuthorsJSON)
	return err
}

func (r *TalksRepo) Delete(ctx context.Context, id uuid.UUID, speakerID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM talks WHERE id=$1 AND speaker_user_id=$2`, id, speakerID)
	return err
}

func (r *TalksRepo) Get(ctx context.Context, id uuid.UUID) (*domain.Talk, error) {
	row := r.db.QueryRow(ctx, `
SELECT id, speaker_user_id, section_id, title, affiliation, abstract, kind, authors, file_url, created_at
FROM talks WHERE id=$1`, id)

	var t domain.Talk
	var kind string
	if err := row.Scan(&t.ID, &t.SpeakerUserID, &t.SectionID, &t.Title, &t.Affiliation, &t.Abstract, &kind, &t.AuthorsJSON, &t.FileURL, &t.CreatedAt); err != nil {
		return nil, err
	}
	t.Kind = domain.TalkKind(kind)
	return &t, nil
}

func (r *TalksRepo) ListBySpeaker(ctx context.Context, speakerID uuid.UUID) ([]domain.Talk, error) {
	rows, err := r.db.Query(ctx, `
SELECT id, speaker_user_id, section_id, title, affiliation, abstract, kind, authors, file_url, created_at
FROM talks WHERE speaker_user_id=$1 ORDER BY created_at DESC`, speakerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.Talk
	for rows.Next() {
		var t domain.Talk
		var kind string
		if err := rows.Scan(&t.ID, &t.SpeakerUserID, &t.SectionID, &t.Title, &t.Affiliation, &t.Abstract, &kind, &t.AuthorsJSON, &t.FileURL, &t.CreatedAt); err != nil {
			return nil, err
		}
		t.Kind = domain.TalkKind(kind)
		out = append(out, t)
	}
	return out, rows.Err()
}

func (r *TalksRepo) CountBySpeaker(ctx context.Context, speakerID uuid.UUID) (int64, error) {
	return r.q.CountTalksBySpeaker(ctx, speakerID)
}

func (r *TalksRepo) ListAdmin(ctx context.Context, sectionID *uuid.UUID, onlyPlenary bool) ([]domain.AdminTalkRow, error) {
	// section filter + plenary filter; speaker profile join
	query := `
SELECT
	t.id, t.title, t.kind, t.authors, t.abstract,
	t.section_id, t.schedule_time, t.file_url,
	s.title_ru, s.title_en,
	p.surname || ' ' || p.name || ' ' || p.patronymic AS speaker_full_name,
	p.city, p.affiliation
FROM talks t
JOIN profiles p ON p.user_id=t.speaker_user_id
LEFT JOIN sections s ON s.id=t.section_id
WHERE ( $1::uuid IS NULL OR t.section_id=$1 )
  AND ( $2::boolean = false OR t.kind='PLENARY' )
ORDER BY COALESCE(t.schedule_time, t.created_at) DESC`
	
	println("ListAdmin: executing query with sectionID=", sectionID, "onlyPlenary=", onlyPlenary)
	
	rows, err := r.db.Query(ctx, query, sectionID, onlyPlenary)
	if err != nil {
		println("ListAdmin query error:", err.Error())
		return nil, err
	}
	defer rows.Close()

	var out []domain.AdminTalkRow
	for rows.Next() {
		var row domain.AdminTalkRow
		var kind string
		if err := rows.Scan(
			&row.ID, &row.Title, &kind, &row.AuthorsJSON, &row.Abstract,
			&row.SectionID, &row.ScheduleTime, &row.FileURL,
			&row.SectionTitleRu, &row.SectionTitleEn,
			&row.SpeakerFullName, &row.SpeakerCity, &row.SpeakerAffiliation,
		); err != nil {
			println("ListAdmin scan error:", err.Error())
			return nil, err
		}
		row.Kind = domain.TalkKind(kind)
		out = append(out, row)
	}
	println("ListAdmin: found", len(out), "talks, checking rows.Err()...")
	if err := rows.Err(); err != nil {
		println("ListAdmin rows.Err():", err.Error())
		return nil, err
	}
	println("ListAdmin returning", len(out), "talks successfully")
	return out, nil
}

func (r *TalksRepo) UpdateSchedule(ctx context.Context, talkID uuid.UUID, sectionID *uuid.UUID, scheduleTime *time.Time) error {
	_, err := r.db.Exec(ctx, `
UPDATE talks
SET section_id=$1, schedule_time=$2
WHERE id=$3`,
		sectionID, scheduleTime, talkID)
	return err
}

func (r *TalksRepo) UpdateFile(ctx context.Context, talkID uuid.UUID, fileURL string) error {
	println("UpdateFile: talkID =", talkID.String(), "fileURL =", fileURL)
	_, err := r.db.Exec(ctx, `
UPDATE talks
SET file_url=$1
WHERE id=$2`,
		fileURL, talkID)
	if err != nil {
		println("UpdateFile error:", err.Error())
	} else {
		println("UpdateFile success")
	}
	return err
}
