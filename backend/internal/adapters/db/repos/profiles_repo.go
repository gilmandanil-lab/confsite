package repos

import (
	"context"
	"strings"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProfilesRepo struct {
	q  *sqlc.Queries
	db *pgxpool.Pool
}

func NewProfilesRepo(db *pgxpool.Pool) *ProfilesRepo {
	return &ProfilesRepo{q: sqlc.New(db), db: db}
}

func (r *ProfilesRepo) Upsert(ctx context.Context, p domain.Profile) error {
	var deg pgtype.Text
	if p.AcademicDegree != nil {
		deg = pgtype.Text{String: *p.AcademicDegree, Valid: true}
	}
	return r.q.UpsertProfile(ctx, sqlc.UpsertProfileParams{
		UserID:                  p.UserID,
		Surname:                 p.Surname,
		Name:                    p.Name,
		Patronymic:              p.Patronymic,
		BirthDate:               p.BirthDate,
		City:                    p.City,
		AcademicDegree:          deg,
		Affiliation:             p.Affiliation,
		Position:                p.Position,
		Phone:                   p.Phone,
		PostalAddress:           p.PostalAddress,
		ConsentDataProcessing:   p.ConsentDataProcessing,
		ConsentDataTransfer:     p.ConsentDataTransfer,
	})
}

func (r *ProfilesRepo) Get(ctx context.Context, userID uuid.UUID) (*domain.Profile, error) {
	p, err := r.q.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}
	return &domain.Profile{
		UserID:                  p.UserID,
		Surname:                 p.Surname,
		Name:                    p.Name,
		Patronymic:              p.Patronymic,
		BirthDate:               p.BirthDate,
		City:                    p.City,
		AcademicDegree:          textPtr(p.AcademicDegree),
		Affiliation:             p.Affiliation,
		Position:                p.Position,
		Phone:                   p.Phone,
		PostalAddress:           p.PostalAddress,
		ConsentDataProcessing:   p.ConsentDataProcessing,
		ConsentDataTransfer:     p.ConsentDataTransfer,
		UpdatedAt:               p.UpdatedAt,
	}, nil
}

func (r *ProfilesRepo) ListApprovedPublic(ctx context.Context) ([]domain.PublicParticipant, error) {
	rows, err := r.db.Query(ctx, `
SELECT p.surname, p.name, p.patronymic, p.affiliation, p.city
FROM profiles p
JOIN users u ON u.id=p.user_id
WHERE u.status='APPROVED'
ORDER BY p.surname, p.name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.PublicParticipant
	for rows.Next() {
		var s, n, pat, aff, city string
		if err := rows.Scan(&s, &n, &pat, &aff, &city); err != nil {
			return nil, err
		}
		full := strings.TrimSpace(s + " " + n + " " + pat)
		out = append(out, domain.PublicParticipant{FullName: full, Affiliation: aff, City: city})
	}
	return out, rows.Err()
}
