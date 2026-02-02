package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"time"

	"confsite/backend/internal/domain"
	"confsite/backend/internal/lib/auth"
	"confsite/backend/internal/ports"

	"github.com/google/uuid"
)

type AuthService struct {
	cfg       AppConfig
	users     ports.UserRepo
	sessions  ports.SessionRepo
	tokens    ports.EmailTokenRepo
	profiles  ports.ProfileRepo
	mailer    ports.Mailer
	templates EmailTemplates
	clock     ports.Clock
	jwtSecret []byte
}

type IssuedTokens struct {
	AccessToken  string
	AccessExp    time.Time
	RefreshToken string
	RefreshExp   time.Time
	UserID       uuid.UUID
	Roles        []string
	Status       domain.UserStatus
	Email        string
}

func NewAuthService(
	cfg AppConfig,
	jwtSecret []byte,
	users ports.UserRepo,
	sessions ports.SessionRepo,
	tokens ports.EmailTokenRepo,
	profiles ports.ProfileRepo,
	mailer ports.Mailer,
	templates EmailTemplates,
	clock ports.Clock,
) *AuthService {
	return &AuthService{
		cfg: cfg, jwtSecret: jwtSecret,
		users: users, sessions: sessions, tokens: tokens, profiles: profiles,
		mailer: mailer, templates: templates, clock: clock,
	}
}

func (s *AuthService) Register(ctx context.Context, email, password, lang string) error {
	if len(password) < 8 {
		return domain.ErrInvalidInput
	}
	hash, err := auth.HashPassword(password)
	if err != nil {
		return err
	}
	userID, err := s.users.Create(ctx, email, hash)
	if err != nil {
		return err
	}
	// default role USER
	_ = s.users.AssignRole(ctx, userID, domain.RoleUser, nil)

	// Mark email as verified immediately (no verification needed)
	if err := s.users.SetEmailVerified(ctx, userID, true); err != nil {
		// Log error but don't fail registration
		println("Warning: failed to mark email as verified for user", userID.String(), ":", err.Error())
	}

	// create profile (required for talks and other features)
	if err := s.profiles.Upsert(ctx, domain.Profile{UserID: userID, Name: "", Surname: "", Patronymic: ""}); err != nil {
		// Log error but don't fail registration
		println("Warning: failed to create profile for user", userID.String(), ":", err.Error())
	}

	// Send welcome email asynchronously in a goroutine to avoid blocking registration
	// Use simple welcome email without verification link
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
		defer cancel()
		subj, html, text := s.templates.WelcomeEmail(SafeLang(lang))
		if err := s.mailer.Send(ctx, email, subj, html, text); err != nil {
			println("Warning: failed to send welcome email to", email, ":", err.Error())
		}
	}()
	return nil
}

func (s *AuthService) VerifyEmail(ctx context.Context, token string) error {
	th := hashToken(token)
	t, err := s.tokens.ByTokenHash(ctx, th)
	if err != nil {
		return domain.ErrInvalidInput
	}
	if t.UsedAt != nil {
		return domain.ErrInvalidInput
	}
	if s.clock.Now().After(t.ExpiresAt) {
		return domain.ErrInvalidInput
	}
	if err := s.tokens.MarkUsed(ctx, t.ID); err != nil {
		return err
	}
	return s.users.SetEmailVerified(ctx, t.UserID, true)
}

func (s *AuthService) Login(ctx context.Context, email, password, lang string) (*IssuedTokens, error) {
	u, roles, err := s.users.ByEmail(ctx, email)
	if err != nil {
		return nil, domain.ErrUnauthorized
	}
	if !auth.CheckPassword(u.PasswordHash, password) {
		return nil, domain.ErrUnauthorized
	}

	roleCodes := rolesToStrings(roles, u.Status)
	access, accessExp, err := s.issueAccess(u.ID, roleCodes)
	if err != nil {
		return nil, err
	}
	rawRefresh, refreshHash, err := newTokenPair()
	if err != nil {
		return nil, err
	}
	refreshExp := s.clock.Now().Add(s.cfg.RefreshTTL)
	if err := s.sessions.Create(ctx, u.ID, refreshHash, refreshExp); err != nil {
		return nil, err
	}

	return &IssuedTokens{
		AccessToken: access, AccessExp: accessExp,
		RefreshToken: rawRefresh, RefreshExp: refreshExp,
		UserID: u.ID, Roles: roleCodes, Status: u.Status, Email: u.Email,
	}, nil
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*IssuedTokens, error) {
	hash := hashToken(refreshToken)
	sess, err := s.sessions.ByTokenHash(ctx, hash)
	if err != nil {
		return nil, domain.ErrUnauthorized
	}
	if sess.RevokedAt != nil {
		return nil, domain.ErrUnauthorized
	}
	if s.clock.Now().After(sess.ExpiresAt) {
		return nil, domain.ErrUnauthorized
	}

	// rotation: revoke old, issue new refresh
	if err := s.sessions.Revoke(ctx, sess.ID); err != nil {
		return nil, err
	}

	u, roles, err := s.users.ByID(ctx, sess.UserID)
	if err != nil {
		return nil, domain.ErrUnauthorized
	}
	roleCodes := rolesToStrings(roles, u.Status)

	access, accessExp, err := s.issueAccess(u.ID, roleCodes)
	if err != nil {
		return nil, err
	}

	rawRefresh, refreshHash, err := newTokenPair()
	if err != nil {
		return nil, err
	}
	refreshExp := s.clock.Now().Add(s.cfg.RefreshTTL)
	if err := s.sessions.Create(ctx, u.ID, refreshHash, refreshExp); err != nil {
		return nil, err
	}

	return &IssuedTokens{
		AccessToken: access, AccessExp: accessExp,
		RefreshToken: rawRefresh, RefreshExp: refreshExp,
		UserID: u.ID, Roles: roleCodes, Status: u.Status, Email: u.Email,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	hash := hashToken(refreshToken)
	sess, err := s.sessions.ByTokenHash(ctx, hash)
	if err != nil {
		return nil
	}
	return s.sessions.Revoke(ctx, sess.ID)
}

func (s *AuthService) issueAccess(userID uuid.UUID, roles []string) (string, time.Time, error) {
	now := s.clock.Now()
	token, err := auth.SignAccessJWT(s.jwtSecret, userID, roles, s.cfg.AccessTTL)
	return token, now.Add(s.cfg.AccessTTL), err
}

func rolesToStrings(rs []domain.RoleAssignment, status domain.UserStatus) []string {
	out := make([]string, 0, len(rs)+2)
	for _, r := range rs {
		out = append(out, string(r.Role))
	}
	// Derive PARTICIPANT role from approved status (optional)
	if status == domain.StatusApproved {
		found := false
		for _, x := range out {
			if x == string(domain.RoleParticipant) {
				found = true
			}
		}
		if !found {
			out = append(out, string(domain.RoleParticipant))
		}
	}
	return out
}

func newTokenPair() (raw string, hash string, err error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}
	raw = hex.EncodeToString(b)
	hash = hashToken(raw)
	return raw, hash, nil
}

func hashToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}
