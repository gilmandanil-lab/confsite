package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"strings"
	"unicode/utf8"

	"confsite/backend/internal/domain"
	"confsite/backend/internal/ports"

	"github.com/google/uuid"
)

type TalkService struct {
	cfg       AppConfig
	talks     ports.TalkRepo
	profiles  ports.ProfileRepo
	sections  ports.SectionRepo
	users     ports.UserRepo
	mailer    ports.Mailer
	templates EmailTemplates
}

func NewTalkService(cfg AppConfig, tr ports.TalkRepo, pr ports.ProfileRepo, sr ports.SectionRepo, ur ports.UserRepo, m ports.Mailer, t EmailTemplates) *TalkService {
	return &TalkService{cfg: cfg, talks: tr, profiles: pr, sections: sr, users: ur, mailer: m, templates: t}
}

func (s *TalkService) validateTalk(t domain.Talk) error {
	if strings.TrimSpace(t.Title) == "" {
		return domain.ErrInvalidInput
	}
	if strings.TrimSpace(t.Affiliation) == "" {
		return domain.ErrInvalidInput
	}
	n := utf8.RuneCountInString(t.Abstract)
	if n < 250 || n > 350 {
		return errors.New("abstract must be 250-350 chars")
	}

	var authors []domain.TalkAuthor
	if err := json.Unmarshal(t.AuthorsJSON, &authors); err != nil || len(authors) == 0 {
		return errors.New("authors required")
	}
	for _, a := range authors {
		if strings.TrimSpace(a.FullName) == "" || strings.TrimSpace(a.Affiliation) == "" {
			return errors.New("each author needs fullName and affiliation")
		}
	}
	if t.Kind != domain.TalkPlenary && t.Kind != domain.TalkOral && t.Kind != domain.TalkPoster {
		return errors.New("bad kind")
	}
	return nil
}

func (s *TalkService) Create(ctx context.Context, speakerID uuid.UUID, t domain.Talk) (uuid.UUID, error) {
	t.SpeakerUserID = speakerID
	t.Status = domain.TalkStatusWaiting
	if err := s.validateTalk(t); err != nil {
		return uuid.Nil, err
	}
	cnt, err := s.talks.CountBySpeaker(ctx, speakerID)
	if err == nil && cnt >= 3 {
		return uuid.Nil, domain.ErrTalkLimitReached
	}
	return s.talks.Create(ctx, t)
}

func (s *TalkService) Update(ctx context.Context, speakerID uuid.UUID, t domain.Talk) error {
	orig, err := s.talks.Get(ctx, t.ID)
	if err != nil {
		return err
	}
	if orig.SpeakerUserID != speakerID {
		return domain.ErrForbidden
	}
	t.SpeakerUserID = speakerID
	t.Status = domain.TalkStatusWaiting
	if err := s.validateTalk(t); err != nil {
		return err
	}
	return s.talks.Update(ctx, t)
}

func (s *TalkService) Delete(ctx context.Context, speakerID, talkID uuid.UUID) error {
	return s.talks.Delete(ctx, talkID, speakerID)
}

func (s *TalkService) ListMine(ctx context.Context, speakerID uuid.UUID) ([]domain.Talk, error) {
	return s.talks.ListBySpeaker(ctx, speakerID)
}

func (s *TalkService) GetMine(ctx context.Context, speakerID, talkID uuid.UUID) (*domain.Talk, error) {
	t, err := s.talks.Get(ctx, talkID)
	if err != nil {
		return nil, err
	}
	if t.SpeakerUserID != speakerID {
		return nil, domain.ErrForbidden
	}
	return t, nil
}

// Call this from handler after storing thesis file. fileURL may be empty.
func (s *TalkService) NotifyFileUploaded(ctx context.Context, speakerID, talkID uuid.UUID, fileURL string, lang string) error {
	t, err := s.talks.Get(ctx, talkID)
	if err != nil {
		return err
	}
	if t.SpeakerUserID != speakerID {
		return domain.ErrForbidden
	}

	prof, _ := s.profiles.Get(ctx, speakerID)
	u, _, _ := s.users.ByID(ctx, speakerID)

	// email to user
	subj, html, text := s.templates.TalkFileUploadedToUser(SafeLang(lang), t.Title)
	_ = s.mailer.Send(ctx, u.Email, subj, html, text)

	_ = s.notifyResponsibles(ctx, t, prof, fileURL)

	return nil
}

// SetFileURL stores file URL for a talk and notifies relevant parties.
func (s *TalkService) SetFileURL(ctx context.Context, speakerID, talkID uuid.UUID, fileURL string, lang string) error {
	t, err := s.talks.Get(ctx, talkID)
	if err != nil {
		return err
	}
	if t.SpeakerUserID != speakerID {
		return domain.ErrForbidden
	}
	// persist file URL
	if err := s.talks.UpdateFile(ctx, talkID, fileURL); err != nil {
		return err
	}
	// send notifications
	return s.NotifyFileUploaded(ctx, speakerID, talkID, fileURL, lang)
}

func (s *TalkService) notifyResponsibles(ctx context.Context, t *domain.Talk, prof *domain.Profile, fileURL string) error {
	recipients := make([]string, 0, 3)
	seen := make(map[string]struct{})
	addRecipient := func(email string) {
		e := strings.ToLower(strings.TrimSpace(email))
		if e == "" {
			return
		}
		if _, exists := seen[e]; exists {
			return
		}
		seen[e] = struct{}{}
		recipients = append(recipients, e)
	}

	// Primary recipients: section responsibles.
	if t.SectionID != nil {
		all, err := s.sections.ListResponsibleEmails(ctx)
		if err != nil {
			return err
		}
		for _, item := range all {
			if item.SectionID == *t.SectionID {
				addRecipient(item.Email)
			}
		}
	}

	// Fallback recipients: organizers from config.
	if len(recipients) == 0 {
		for _, org := range s.cfg.OrganizerEmails {
			addRecipient(org)
		}
	}
	if len(recipients) == 0 {
		println("Warning: no recipients found for talk notification:", t.ID.String())
		return nil
	}

	authors := authorsToLine(t.AuthorsJSON)
	subject := "Новый доклад на проверку: " + strings.TrimSpace(t.Title)
	textBody := fmt.Sprintf(`«ФИЗИКА НИЗКОТЕМПЕРАТУРНОЙ ПЛАЗМЫ» (ФНТП-2026)

Название доклада: %s
Аннотация:
%s

Файл тезиса: %s
Авторы: %s
Докладчик: %s`,
		strings.TrimSpace(t.Title),
		strings.TrimSpace(t.Abstract),
		strings.TrimSpace(fileURL),
		strings.TrimSpace(authors),
		strings.TrimSpace(fullName(prof)),
	)
	htmlBody := fmt.Sprintf(
		"<p><strong>«ФИЗИКА НИЗКОТЕМПЕРАТУРНОЙ ПЛАЗМЫ» (ФНТП-2026)</strong></p><p><strong>Название доклада:</strong> %s</p><p><strong>Аннотация:</strong><br>%s</p><p><strong>Файл тезиса:</strong> <a href=\"%s\">%s</a></p><p><strong>Авторы:</strong> %s</p><p><strong>Докладчик:</strong> %s</p>",
		html.EscapeString(strings.TrimSpace(t.Title)),
		html.EscapeString(strings.TrimSpace(t.Abstract)),
		html.EscapeString(strings.TrimSpace(fileURL)),
		html.EscapeString(strings.TrimSpace(fileURL)),
		html.EscapeString(strings.TrimSpace(authors)),
		html.EscapeString(strings.TrimSpace(fullName(prof))),
	)

	for _, to := range recipients {
		if err := s.mailer.Send(ctx, to, subject, htmlBody, textBody); err != nil {
			println("Warning: failed to send talk notification email to", to, ":", err.Error())
		}
	}
	return nil
}

func authorsToLine(b []byte) string {
	var authors []domain.TalkAuthor
	if err := json.Unmarshal(b, &authors); err != nil {
		return ""
	}
	parts := make([]string, 0, len(authors))
	for _, a := range authors {
		parts = append(parts, strings.TrimSpace(a.FullName)+" ("+strings.TrimSpace(a.Affiliation)+")")
	}
	return strings.Join(parts, "; ")
}

func fullName(p *domain.Profile) string {
	if p == nil {
		return ""
	}
	return strings.TrimSpace(p.Surname + " " + p.Name + " " + p.Patronymic)
}

func safeStr(s string) string {
	return strings.TrimSpace(s)
}
