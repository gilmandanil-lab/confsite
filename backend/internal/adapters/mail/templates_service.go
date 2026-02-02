package mail

import (
	"fmt"

	"confsite/backend/internal/app/services"
)

type TemplatesService struct {
	t *Templates
}

func NewTemplatesService(t *Templates) *TemplatesService {
	return &TemplatesService{t: t}
}

func (s *TemplatesService) VerifyEmail(lang string, verifyURL string) (string, string, string) {
	lang = safeLang(lang)
	data := map[string]any{"VerifyURL": verifyURL}
	html, _ := s.t.renderHTML(lang, "verify_email", data)
	txt, _ := s.t.renderText(lang, "verify_email", data)

	subj := "Подтверждение email"
	if lang == "en" {
		subj = "Verify your email"
	}
	return subj, html, txt
}

func (s *TemplatesService) WelcomeEmail(lang string) (string, string, string) {
	lang = safeLang(lang)
	html, _ := s.t.renderHTML(lang, "welcome_email", nil)
	txt, _ := s.t.renderText(lang, "welcome_email", nil)
	subj := "Добро пожаловать!"
	if lang == "en" {
		subj = "Welcome!"
	}
	return subj, html, txt
}

func (s *TemplatesService) RegistrationReceived(lang string) (string, string, string) {
	lang = safeLang(lang)
	html, _ := s.t.renderHTML(lang, "registration_received", nil)
	txt, _ := s.t.renderText(lang, "registration_received", nil)
	subj := "Заявка получена"
	if lang == "en" {
		subj = "Application received"
	}
	return subj, html, txt
}

func (s *TemplatesService) StatusApproved(lang string) (string, string, string) {
	lang = safeLang(lang)
	html, _ := s.t.renderHTML(lang, "status_approved", nil)
	txt, _ := s.t.renderText(lang, "status_approved", nil)
	subj := "Заявка одобрена"
	if lang == "en" {
		subj = "Application approved"
	}
	return subj, html, txt
}

func (s *TemplatesService) StatusRejected(lang string) (string, string, string) {
	lang = safeLang(lang)
	html, _ := s.t.renderHTML(lang, "status_rejected", nil)
	txt, _ := s.t.renderText(lang, "status_rejected", nil)
	subj := "Заявка отклонена"
	if lang == "en" {
		subj = "Application rejected"
	}
	return subj, html, txt
}

func (s *TemplatesService) OrgNewRegistration(lang string, fullName, affiliation, city, email string) (string, string, string) {
	lang = safeLang(lang)
	data := map[string]any{
		"FullName": fullName, "Affiliation": affiliation, "City": city, "Email": email,
	}
	html, _ := s.t.renderHTML(lang, "org_new_registration", data)
	txt, _ := s.t.renderText(lang, "org_new_registration", data)
	subj := "Новая заявка"
	if lang == "en" {
		subj = "New application"
	}
	return subj, html, txt
}

func (s *TemplatesService) TalkFileUploadedToUser(lang string, talkTitle string) (string, string, string) {
	lang = safeLang(lang)
	data := map[string]any{"TalkTitle": talkTitle}
	html, _ := s.t.renderHTML(lang, "talk_file_uploaded", data)
	txt, _ := s.t.renderText(lang, "talk_file_uploaded", data)
	subj := "Загружены тезисы"
	if lang == "en" {
		subj = "Thesis uploaded"
	}
	return subj, html, txt
}

func (s *TemplatesService) OrgTalkFileUploaded(lang string, payload services.OrgTalkUploadedPayload) (string, string, string) {
	lang = safeLang(lang)
	data := map[string]any{
		"SpeakerFullName":    payload.SpeakerFullName,
		"SpeakerAffiliation": payload.SpeakerAffiliation,
		"SpeakerCity":        payload.SpeakerCity,
		"Title":              payload.Title,
		"AuthorsLine":        payload.AuthorsLine,
		"Abstract":           payload.Abstract,
		"Kind":               payload.Kind,
		"Section":            payload.Section,
		"FileNoteOrURL":      payload.FileNoteOrURL,
	}
	html, _ := s.t.renderHTML(lang, "org_talk_file_uploaded", data)
	txt, _ := s.t.renderText(lang, "org_talk_file_uploaded", data)
	subj := "Тезисы загружены (доклад)"
	if lang == "en" {
		subj = "Thesis uploaded (talk)"
	}
	return subj, html, txt
}

var _ services.EmailTemplates = (*TemplatesService)(nil)

func fmtStr(s string) string { return fmt.Sprintf("%v", s) }
