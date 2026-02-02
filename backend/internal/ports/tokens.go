package ports

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type EmailVerifyToken struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	TokenHash string
	ExpiresAt time.Time
	UsedAt    *time.Time
	CreatedAt time.Time
}

type EmailTokenRepo interface {
	Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error
	ByTokenHash(ctx context.Context, tokenHash string) (*EmailVerifyToken, error)
	MarkUsed(ctx context.Context, tokenID uuid.UUID) error
}
