package services

import (
	"context"
	"errors"
	"fmt"
	"html"

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

func (s *AdminService) SetUserStatus(ctx context.Context, userID uuid.UUID, status domain.UserStatus, _ string) error {
	if status != domain.StatusApproved && status != domain.StatusRejected && status != domain.StatusWaiting {
		return domain.ErrInvalidInput
	}
	u, _, err := s.users.ByID(ctx, userID)
	if err != nil {
		return err
	}
	prevStatus := u.Status

	if err := s.users.SetStatus(ctx, userID, status); err != nil {
		return err
	}

	// Notify user only when moderation decision is made for the first time.
	if prevStatus == domain.StatusWaiting {
		switch status {
		case domain.StatusApproved:
			subj, html, text := s.templates.StatusApproved("ru")
			_, htmlEn, textEn := s.templates.StatusApproved("en")
			if err := s.mailer.Send(
				ctx,
				u.Email,
				subj+" / Application approved",
				html+"<hr><p><strong>English</strong></p>"+htmlEn,
				text+"\n\n--- English ---\n"+textEn,
			); err != nil {
				println("Warning: failed to send user status approved email to", u.Email, ":", err.Error())
			}
		case domain.StatusRejected:
			subj, html, text := s.templates.StatusRejected("ru")
			_, htmlEn, textEn := s.templates.StatusRejected("en")
			if err := s.mailer.Send(
				ctx,
				u.Email,
				subj+" / Application rejected",
				html+"<hr><p><strong>English</strong></p>"+htmlEn,
				text+"\n\n--- English ---\n"+textEn,
			); err != nil {
				println("Warning: failed to send user status rejected email to", u.Email, ":", err.Error())
			}
		}
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

func (s *AdminService) SetTalkStatus(ctx context.Context, talkID uuid.UUID, status domain.TalkStatus) error {
	if status != domain.TalkStatusApproved && status != domain.TalkStatusRejected && status != domain.TalkStatusWaiting {
		return domain.ErrInvalidInput
	}
	t, err := s.talks.Get(ctx, talkID)
	if err != nil {
		return err
	}
	prev := t.Status

	if err := s.talks.SetStatus(ctx, talkID, status); err != nil {
		return err
	}

	// Notify speaker only for first moderation decision.
	if prev == domain.TalkStatusWaiting {
		u, _, err := s.users.ByID(ctx, t.SpeakerUserID)
		if err == nil {
			sendTalkStatusEmail(ctx, s.mailer, u.Email, t.Title, status)
		}
	}

	return nil
}

func sendTalkStatusEmail(ctx context.Context, mailer ports.Mailer, email, talkTitle string, status domain.TalkStatus) {
	var subj string
	var text string
	var htmlBody string

	switch status {
	case domain.TalkStatusApproved:
		subj = "Доклад одобрен / Talk approved"
		safeTitle := html.EscapeString(talkTitle)
		text = fmt.Sprintf(
			"Ваш доклад «%s» одобрен программным комитетом.\n\nYour talk \"%s\" was approved by the program committee.",
			talkTitle, talkTitle,
		)
		htmlBody = fmt.Sprintf(
			"<p>Ваш доклад «%s» одобрен программным комитетом.</p><hr><p>Your talk \"%s\" was approved by the program committee.</p>",
			safeTitle, safeTitle,
		)
	case domain.TalkStatusRejected:
		subj = "Доклад отклонен / Talk rejected"
		safeTitle := html.EscapeString(talkTitle)
		text = fmt.Sprintf(
			"Ваш доклад «%s» отклонен программным комитетом.\n\nYour talk \"%s\" was rejected by the program committee.",
			talkTitle, talkTitle,
		)
		htmlBody = fmt.Sprintf(
			"<p>Ваш доклад «%s» отклонен программным комитетом.</p><hr><p>Your talk \"%s\" was rejected by the program committee.</p>",
			safeTitle, safeTitle,
		)
	default:
		return
	}

	if err := mailer.Send(ctx, email, subj, htmlBody, text); err != nil {
		println("Warning: failed to send talk status email to", email, ":", err.Error())
	}
}
