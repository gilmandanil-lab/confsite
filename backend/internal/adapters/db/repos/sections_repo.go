package repos

import (
	"context"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SectionsRepo struct {
	q *sqlc.Queries
}

func NewSectionsRepo(db *pgxpool.Pool) *SectionsRepo {
	return &SectionsRepo{q: sqlc.New(db)}
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
