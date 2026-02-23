package repos

import (
	"context"
	"strings"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SectionsRepo struct {
	q  *sqlc.Queries
	db *pgxpool.Pool
}

func NewSectionsRepo(db *pgxpool.Pool) *SectionsRepo {
	return &SectionsRepo{q: sqlc.New(db), db: db}
}

func (r *SectionsRepo) List(ctx context.Context) ([]domain.Section, error) {
	ss, err := r.q.ListSections(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]domain.Section, 0, len(ss))
	for _, s := range ss {
		out = append(out, domain.Section{
			ID:        s.ID,
			TitleRu:   s.TitleRu,
			TitleEn:   s.TitleEn,
			SortOrder: s.SortOrder,
		})
	}
	return out, nil
}

func (r *SectionsRepo) Create(ctx context.Context, titleRu, titleEn string, sortOrder int32) error {
	return r.q.CreateSection(ctx, sqlc.CreateSectionParams{
		TitleRu:   titleRu,
		TitleEn:   titleEn,
		SortOrder: sortOrder,
	})
}

func (r *SectionsRepo) ListResponsibleEmails(ctx context.Context) ([]domain.SectionResponsibleEmail, error) {
	rows, err := r.db.Query(ctx, `
SELECT section_id, email
FROM section_responsibles
ORDER BY section_id, lower(email)`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]domain.SectionResponsibleEmail, 0)
	for rows.Next() {
		var item domain.SectionResponsibleEmail
		if err := rows.Scan(&item.SectionID, &item.Email); err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (r *SectionsRepo) ReplaceResponsibleEmails(ctx context.Context, sectionID uuid.UUID, emails []string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `DELETE FROM section_responsibles WHERE section_id = $1`, sectionID); err != nil {
		return err
	}

	for _, email := range emails {
		e := strings.ToLower(strings.TrimSpace(email))
		if e == "" {
			continue
		}
		if _, err := tx.Exec(ctx, `
INSERT INTO section_responsibles (section_id, email)
VALUES ($1, $2)
ON CONFLICT (section_id, email) DO NOTHING`, sectionID, e); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}
