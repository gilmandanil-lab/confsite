package services

import (
	"fmt"
)

type EmailTemplates interface {
	VerifyEmail(lang string, verifyURL string) (subject, html, text string)
	WelcomeEmail(lang string) (subject, html, text string)
	RegistrationReceived(lang string) (subject, html, text string)
	StatusApproved(lang string) (subject, html, text string)
	StatusRejected(lang string) (subject, html, text string)

	OrgNewRegistration(lang string, fullName, affiliation, city, email string) (subject, html, text string)

	TalkFileUploadedToUser(lang string, talkTitle string) (subject, html, text string)
	OrgTalkFileUploaded(lang string, payload OrgTalkUploadedPayload) (subject, html, text string)
}

type OrgTalkUploadedPayload struct {
	SpeakerFullName    string
	SpeakerAffiliation string
	SpeakerCity        string
	Title              string
	AuthorsLine        string
	Abstract           string
	Kind               string
	Section            string
	FileNoteOrURL      string
}

func joinURL(base, path string) string {
	if len(base) == 0 {
		return path
	}
	if base[len(base)-1] == '/' && len(path) > 0 && path[0] == '/' {
		return base[:len(base)-1] + path
	}
	if base[len(base)-1] != '/' && len(path) > 0 && path[0] != '/' {
		return base + "/" + path
	}
	return base + path
}

func VerifyURL(appURL, token string) string {
	return joinURL(appURL, "/verify-email?token="+token)
}

func SafeLang(lang string) string {
	if lang == "en" {
		return "en"
	}
	return "ru"
}

func OneLine(s string) string {
	// used for email formatting; keep it simple here
	return fmt.Sprintf("%v", s)
}
