package repos

import (
	"context"
	"time"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionsRepo struct {
	q *sqlc.Queries
}

func NewSessionsRepo(db *pgxpool.Pool) *SessionsRepo {
	return &SessionsRepo{q: sqlc.New(db)}
}

func (r *SessionsRepo) Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error {
	return r.q.CreateSession(ctx, sqlc.CreateSessionParams{
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
	})
}

func (r *SessionsRepo) ByTokenHash(ctx context.Context, tokenHash string) (*domain.RefreshSession, error) {
	s, err := r.q.GetSessionByToken(ctx, tokenHash)
	if err != nil {
		return nil, err
	}
	return &domain.RefreshSession{
		ID:        s.ID,
		UserID:    s.UserID,
		TokenHash: s.TokenHash,
		RevokedAt: timePtr(s.RevokedAt),
		ExpiresAt: s.ExpiresAt,
		CreatedAt: s.CreatedAt,
	}, nil
}

func (r *SessionsRepo) Revoke(ctx context.Context, sessionID uuid.UUID) error {
	return r.q.RevokeSession(ctx, sessionID)
}
