package services

import (
	"context"
	"encoding/json"
	"errors"
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

	// email to organizers
	authorsLine := authorsToLine(t.AuthorsJSON)
	secTitle := ""
	if t.SectionID != nil {
		secs, _ := s.sections.List(ctx)
		for _, ss := range secs {
			if ss.ID == *t.SectionID {
				if SafeLang(lang) == "en" {
					secTitle = ss.TitleEn
				} else {
					secTitle = ss.TitleRu
				}
			}
		}
	}

	fileNote := "нет файла"
	if SafeLang(lang) == "en" {
		fileNote = "no file"
	}
	if fileURL != "" {
		fileNote = fileURL
	}

	payload := OrgTalkUploadedPayload{
		SpeakerFullName: fullName(prof),
		SpeakerAffiliation: safeStr(func() string {
			if prof != nil {
				return prof.Affiliation
			}
			return ""
		}()),
		SpeakerCity: safeStr(func() string {
			if prof != nil {
				return prof.City
			}
			return ""
		}()),
		Title:         t.Title,
		AuthorsLine:   authorsLine,
		Abstract:      t.Abstract,
		Kind:          string(t.Kind),
		Section:       secTitle,
		FileNoteOrURL: fileNote,
	}
	for _, org := range s.cfg.OrganizerEmails {
		subj2, html2, text2 := s.templates.OrgTalkFileUploaded(SafeLang(lang), payload)
		_ = s.mailer.Send(ctx, org, subj2, html2, text2)
	}

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
