package services

import (
	"context"
	"errors"
	"strings"

	"confsite/backend/internal/domain"
	"confsite/backend/internal/ports"

	"github.com/google/uuid"
)

type RegistrationService struct {
	cfg       AppConfig
	users     ports.UserRepo
	profiles  ports.ProfileRepo
	mailer    ports.Mailer
	templates EmailTemplates
}

func NewRegistrationService(cfg AppConfig, u ports.UserRepo, p ports.ProfileRepo, m ports.Mailer, t EmailTemplates) *RegistrationService {
	return &RegistrationService{cfg: cfg, users: u, profiles: p, mailer: m, templates: t}
}

func (s *RegistrationService) Submit(ctx context.Context, userID uuid.UUID, profile domain.Profile, lang string) error {
	u, _, err := s.users.ByID(ctx, userID)
	if err != nil {
		return err
	}
	if u.Status != domain.StatusWaiting {
		return errors.New("already processed")
	}
	if !profile.ConsentDataProcessing || !profile.ConsentDataTransfer {
		return errors.New("all consents required")
	}

	profile.UserID = userID
	if err := s.profiles.Upsert(ctx, profile); err != nil {
		return err
	}

	// user email: received
	subj, html, text := s.templates.RegistrationReceived(SafeLang(lang))
	_ = s.mailer.Send(ctx, u.Email, subj, html, text)

	// org email: new registration
	fullName := strings.TrimSpace(profile.Surname + " " + profile.Name + " " + profile.Patronymic)
	for _, org := range s.cfg.OrganizerEmails {
		subj2, html2, text2 := s.templates.OrgNewRegistration(SafeLang(lang), fullName, profile.Affiliation, profile.City, u.Email)
		_ = s.mailer.Send(ctx, org, subj2, html2, text2)
	}

	return nil
}
