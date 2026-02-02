package repos

import (
	"context"
	"errors"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UsersRepo struct {
	q  *sqlc.Queries
	db *pgxpool.Pool
}

func NewUsersRepo(db *pgxpool.Pool) *UsersRepo {
	return &UsersRepo{q: sqlc.New(db), db: db}
}

func (r *UsersRepo) Create(ctx context.Context, email, passwordHash string) (uuid.UUID, error) {
	id, err := r.q.CreateUser(ctx, sqlc.CreateUserParams{
		Email:        email,
		PasswordHash: passwordHash,
	})
	return id, err
}

func (r *UsersRepo) ByEmail(ctx context.Context, email string) (*domain.User, []domain.RoleAssignment, error) {
	u, err := r.q.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, nil, err
	}
	roles, err := r.loadRoles(ctx, u.ID)
	if err != nil {
		return nil, nil, err
	}
	return mapUser(u), roles, nil
}

func (r *UsersRepo) ByID(ctx context.Context, id uuid.UUID) (*domain.User, []domain.RoleAssignment, error) {
	u, err := r.q.GetUserByID(ctx, id)
	if err != nil {
		return nil, nil, err
	}
	roles, err := r.loadRoles(ctx, u.ID)
	if err != nil {
		return nil, nil, err
	}
	return mapUser(u), roles, nil
}

func (r *UsersRepo) SetEmailVerified(ctx context.Context, id uuid.UUID, verified bool) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET email_verified=$1 WHERE id=$2`, verified, id)
	return err
}

func (r *UsersRepo) SetStatus(ctx context.Context, id uuid.UUID, status domain.UserStatus) error {
	return r.q.UpdateUserStatus(ctx, sqlc.UpdateUserStatusParams{ID: id, Status: string(status)})
}

func (r *UsersRepo) SetPassword(ctx context.Context, id uuid.UUID, passwordHash string) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET password_hash=$1 WHERE id=$2`, passwordHash, id)
	return err
}

func (r *UsersRepo) AssignRole(ctx context.Context, userID uuid.UUID, role domain.Role, sectionID *uuid.UUID) error {
	_, err := r.db.Exec(ctx, `
INSERT INTO user_roles(user_id, role_id, section_id)
SELECT $1, r.id, COALESCE($3, uuid_nil())
FROM roles r
WHERE r.code=$2
ON CONFLICT DO NOTHING`, userID, string(role), sectionID)
	return err
}

func (r *UsersRepo) RemoveRole(ctx context.Context, userID uuid.UUID, role domain.Role, sectionID *uuid.UUID) error {
	_, err := r.db.Exec(ctx, `
DELETE FROM user_roles ur
USING roles r
WHERE ur.user_id=$1 AND ur.role_id=r.id AND r.code=$2 AND
      ( ($3::uuid IS NULL AND ur.section_id IS NULL) OR ur.section_id=$3 )`,
		userID, string(role), sectionID)
	return err
}

func (r *UsersRepo) ListUsers(ctx context.Context) ([]domain.UserWithRoles, error) {
	rows, err := r.db.Query(ctx, `SELECT id,email,password_hash,email_verified,status,created_at,updated_at FROM users ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []domain.UserWithRoles{}
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.EmailVerified, &u.Status, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		rs, err := r.loadRoles(ctx, u.ID)
		if err != nil {
			return nil, err
		}
		out = append(out, domain.UserWithRoles{User: u, Roles: rs})
	}
	return out, rows.Err()
}

func (r *UsersRepo) loadRoles(ctx context.Context, userID uuid.UUID) ([]domain.RoleAssignment, error) {
	rows, err := r.db.Query(ctx, `
SELECT r.code, ur.section_id
FROM user_roles ur
JOIN roles r ON r.id=ur.role_id
WHERE ur.user_id=$1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.RoleAssignment
	for rows.Next() {
		var code string
		var sid *uuid.UUID
		if err := rows.Scan(&code, &sid); err != nil {
			return nil, err
		}
		out = append(out, domain.RoleAssignment{Role: domain.Role(code), SectionID: sid})
	}
	return out, rows.Err()
}

func mapUser(u sqlc.User) *domain.User {
	return &domain.User{
		ID:            u.ID,
		Email:         u.Email,
		PasswordHash:  u.PasswordHash,
		EmailVerified: u.EmailVerified,
		Status:        domain.UserStatus(u.Status),
		CreatedAt:     u.CreatedAt,
		UpdatedAt:     u.UpdatedAt,
	}
}

var _ = errors.New // keep linter quiet if you remove errors in future
