package repos

import (
	"context"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NewsRepo struct {
	q  *sqlc.Queries
	db *pgxpool.Pool
}

func NewNewsRepo(db *pgxpool.Pool) *NewsRepo {
	return &NewsRepo{q: sqlc.New(db), db: db}
}

func (r *NewsRepo) List(ctx context.Context) ([]domain.News, error) {
	ns, err := r.q.ListNews(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]domain.News, 0, len(ns))
	for _, n := range ns {
		out = append(out, domain.News{
			ID:          n.ID,
			TitleRu:     n.TitleRu,
			BodyRu:      n.BodyRu,
			TitleEn:     n.TitleEn,
			BodyEn:      n.BodyEn,
			Pinned:      n.Pinned,
			PublishedAt: n.PublishedAt,
		})
	}
	return out, nil
}

func (r *NewsRepo) Get(ctx context.Context, id uuid.UUID) (*domain.News, error) {
	n, err := r.q.GetNews(ctx, id)
	if err != nil {
		return nil, err
	}
	return &domain.News{
		ID:          n.ID,
		TitleRu:     n.TitleRu,
		BodyRu:      n.BodyRu,
		TitleEn:     n.TitleEn,
		BodyEn:      n.BodyEn,
		Pinned:      n.Pinned,
		PublishedAt: n.PublishedAt,
	}, nil
}

func (r *NewsRepo) Create(ctx context.Context, n domain.News) (uuid.UUID, error) {
	id := uuid.New()
	_, err := r.db.Exec(ctx, `
INSERT INTO news (id,title_ru,body_ru,title_en,body_en,pinned,published_at)
VALUES ($1,$2,$3,$4,$5,$6,now())`,
		id, n.TitleRu, n.BodyRu, n.TitleEn, n.BodyEn, n.Pinned)
	return id, err
}

func (r *NewsRepo) Update(ctx context.Context, n domain.News) error {
	_, err := r.db.Exec(ctx, `
UPDATE news SET title_ru=$2, body_ru=$3, title_en=$4, body_en=$5, pinned=$6
WHERE id=$1`, n.ID, n.TitleRu, n.BodyRu, n.TitleEn, n.BodyEn, n.Pinned)
	return err
}

func (r *NewsRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM news WHERE id=$1`, id)
	return err
}
