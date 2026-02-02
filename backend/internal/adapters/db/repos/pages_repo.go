package repos

import (
	"context"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PagesRepo struct {
	q  *sqlc.Queries
	db *pgxpool.Pool
}

func NewPagesRepo(db *pgxpool.Pool) *PagesRepo {
	return &PagesRepo{q: sqlc.New(db), db: db}
}

func (r *PagesRepo) GetBySlug(ctx context.Context, slug string) (*domain.PageContent, error) {
	p, err := r.q.GetPageBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	return &domain.PageContent{
		Slug:      p.Slug,
		TitleRu:   p.TitleRu,
		BodyRu:    p.BodyRu,
		TitleEn:   p.TitleEn,
		BodyEn:    p.BodyEn,
		UpdatedAt: p.UpdatedAt,
	}, nil
}

func (r *PagesRepo) Upsert(ctx context.Context, p domain.PageContent) error {
	return r.q.UpsertPage(ctx, sqlc.UpsertPageParams{
		Slug:    p.Slug,
		TitleRu: p.TitleRu,
		BodyRu:  p.BodyRu,
		TitleEn: p.TitleEn,
		BodyEn:  p.BodyEn,
	})
}

func (r *PagesRepo) List(ctx context.Context) ([]domain.PageContent, error) {
	rows, err := r.db.Query(ctx, `SELECT slug,title_ru,body_ru,title_en,body_en,updated_at FROM page_contents ORDER BY slug`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.PageContent
	for rows.Next() {
		var p domain.PageContent
		if err := rows.Scan(&p.Slug, &p.TitleRu, &p.BodyRu, &p.TitleEn, &p.BodyEn, &p.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}
