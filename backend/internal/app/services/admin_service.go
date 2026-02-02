package services

import (
	"context"
	"errors"

	"confsite/backend/internal/domain"
	"confsite/backend/internal/ports"

	"github.com/google/uuid"
)

type AdminService struct {
	cfg       AppConfig
	users     ports.UserRepo
	profiles  ports.ProfileRepo
	talks     ports.TalkRepo
	sections  ports.SectionRepo
	news      ports.NewsRepo
	pages     ports.PageRepo
	audit     ports.AuditRepo
	mailer    ports.Mailer
	templates EmailTemplates
}

func NewAdminService(
	cfg AppConfig,
	u ports.UserRepo,
	p ports.ProfileRepo,
	tr ports.TalkRepo,
	sr ports.SectionRepo,
	nr ports.NewsRepo,
	pr ports.PageRepo,
	ar ports.AuditRepo,
	m ports.Mailer,
	t EmailTemplates,
) *AdminService {
	return &AdminService{cfg: cfg, users: u, profiles: p, talks: tr, sections: sr, news: nr, pages: pr, audit: ar, mailer: m, templates: t}
}

func (s *AdminService) ListUsers(ctx context.Context) ([]domain.UserWithRoles, error) {
	return s.users.ListUsers(ctx)
}

// UserWithProfile is a lightweight composite used by admin APIs.
type UserWithProfile struct {
	User    domain.User
	Roles   []domain.RoleAssignment
	Profile *domain.Profile
}

func (s *AdminService) ListUsersDetailed(ctx context.Context) ([]UserWithProfile, error) {
	users, err := s.users.ListUsers(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]UserWithProfile, 0, len(users))
	for _, u := range users {
		var p *domain.Profile
		// attempt to load profile; if missing, continue with nil profile
		if s.profiles != nil {
			prof, err := s.profiles.Get(ctx, u.ID)
			if err == nil {
				p = prof
			}
		}
		out = append(out, UserWithProfile{User: u.User, Roles: u.Roles, Profile: p})
	}
	return out, nil
}

func (s *AdminService) SetUserStatus(ctx context.Context, userID uuid.UUID, status domain.UserStatus, lang string) error {
	if status != domain.StatusApproved && status != domain.StatusRejected && status != domain.StatusWaiting {
		return domain.ErrInvalidInput
	}
	if err := s.users.SetStatus(ctx, userID, status); err != nil {
		return err
	}

	u, _, err := s.users.ByID(ctx, userID)
	if err != nil {
		return err
	}

	switch status {
	case domain.StatusApproved:
		subj, html, text := s.templates.StatusApproved(SafeLang(lang))
		_ = s.mailer.Send(ctx, u.Email, subj, html, text)
	case domain.StatusRejected:
		subj, html, text := s.templates.StatusRejected(SafeLang(lang))
		_ = s.mailer.Send(ctx, u.Email, subj, html, text)
	}

	return nil
}

func (s *AdminService) AssignSectionAdmin(ctx context.Context, userID uuid.UUID, sectionID uuid.UUID) error {
	// ensure section exists
	secs, err := s.sections.List(ctx)
	if err != nil {
		return err
	}
	ok := false
	for _, sec := range secs {
		if sec.ID == sectionID {
			ok = true
		}
	}
	if !ok {
		return errors.New("section not found")
	}
	return s.users.AssignRole(ctx, userID, domain.RoleSectionAdmin, &sectionID)
}

func (s *AdminService) RemoveSectionAdmin(ctx context.Context, userID uuid.UUID, sectionID uuid.UUID) error {
	return s.users.RemoveRole(ctx, userID, domain.RoleSectionAdmin, &sectionID)
}
