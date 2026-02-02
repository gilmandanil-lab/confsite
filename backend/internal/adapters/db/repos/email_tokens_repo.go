package repos

import (
	"context"
	"time"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/ports"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EmailTokensRepo struct {
	q *sqlc.Queries
}

func NewEmailTokensRepo(db *pgxpool.Pool) *EmailTokensRepo {
	return &EmailTokensRepo{q: sqlc.New(db)}
}

func (r *EmailTokensRepo) Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error {
	return r.q.CreateEmailToken(ctx, sqlc.CreateEmailTokenParams{
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
	})
}

func (r *EmailTokensRepo) ByTokenHash(ctx context.Context, tokenHash string) (*ports.EmailVerifyToken, error) {
	t, err := r.q.GetEmailTokenByHash(ctx, tokenHash)
	if err != nil {
		return nil, err
	}
	return &ports.EmailVerifyToken{
		ID:        t.ID,
		UserID:    t.UserID,
		TokenHash: t.TokenHash,
		ExpiresAt: t.ExpiresAt,
		UsedAt:    timePtr(t.UsedAt),
		CreatedAt: t.CreatedAt,
	}, nil
}

func (r *EmailTokensRepo) MarkUsed(ctx context.Context, tokenID uuid.UUID) error {
	return r.q.MarkEmailTokenUsed(ctx, tokenID)
}
