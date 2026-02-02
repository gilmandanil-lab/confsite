package repos

import (
	"context"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type AuditRepo struct {
	q  *sqlc.Queries
	db *pgxpool.Pool
}

func NewAuditRepo(db *pgxpool.Pool) *AuditRepo {
	return &AuditRepo{q: sqlc.New(db), db: db}
}

func (r *AuditRepo) Insert(ctx context.Context, e domain.AuditLog) error {
	return r.q.InsertAudit(ctx, sqlc.InsertAuditParams{
		ActorUserID: uuidParam(e.ActorUserID),
		Action:      e.Action,
		Entity:      e.Entity,
		EntityID:    uuidParam(e.EntityID),
	})
}

func (r *AuditRepo) List(ctx context.Context, limit int32) ([]domain.AuditLog, error) {
	rows, err := r.q.ListAudit(ctx)
	if err != nil {
		return nil, err
	}
	if limit > 0 && int(limit) < len(rows) {
		rows = rows[:limit]
	}
	out := make([]domain.AuditLog, 0, len(rows))
	for _, a := range rows {
		out = append(out, domain.AuditLog{
			ID:          a.ID,
			ActorUserID: uuidPtr(a.ActorUserID),
			Action:      a.Action,
			Entity:      a.Entity,
			EntityID:    uuidPtr(a.EntityID),
			CreatedAt:   a.CreatedAt,
		})
	}
	return out, nil
}
