package services

import (
	"time"
)

type AppConfig struct {
	AppURL          string
	AccessTTL       time.Duration
	RefreshTTL      time.Duration
	VerifyEmailTTL  time.Duration
	CookieSecure    bool
	CookieDomain    string
	OrganizerEmails []string
}
