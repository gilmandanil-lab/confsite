package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type DBConfig struct {
	DSN string
}

type JWTConfig struct {
	Secret     []byte
	AccessTTL  time.Duration
	RefreshTTL time.Duration
}

type SMTPConfig struct {
	Host string
	Port int
	From string
	User string
	Pass string
}

type StorageConfig struct {
	Driver    string
	LocalDir  string
	PublicURL string

	S3Endpoint string
	S3Bucket   string
	S3Key      string
	S3Secret   string
	S3Region   string
}

type Config struct {
	Env             string
	AppURL          string
	DB              DBConfig
	JWT             JWTConfig
	SMTP            SMTPConfig
	Storage         StorageConfig
	OrganizerEmails []string
}

func Load() Config {
	accessTTL, _ := strconv.Atoi(os.Getenv("ACCESS_TTL_MIN"))
	refreshTTL, _ := strconv.Atoi(os.Getenv("REFRESH_TTL_DAYS"))
	smtpPort, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))

	return Config{
		Env:    os.Getenv("APP_ENV"),
		AppURL: os.Getenv("APP_URL"),
		DB: DBConfig{
			DSN: os.Getenv("DB_DSN"),
		},
		JWT: JWTConfig{
			Secret:     []byte(os.Getenv("JWT_SECRET")),
			AccessTTL:  time.Duration(accessTTL) * time.Minute,
			RefreshTTL: time.Duration(refreshTTL) * 24 * time.Hour,
		},
		SMTP: SMTPConfig{
			Host: os.Getenv("SMTP_HOST"),
			Port: smtpPort,
			From: os.Getenv("SMTP_FROM"),
			User: os.Getenv("SMTP_USER"),
			Pass: os.Getenv("SMTP_PASS"),
		},
		Storage: StorageConfig{
			Driver:     os.Getenv("STORAGE_DRIVER"),
			LocalDir:   os.Getenv("STORAGE_LOCAL_DIR"),
			PublicURL:  os.Getenv("STORAGE_PUBLIC_URL"),
			S3Endpoint: os.Getenv("S3_ENDPOINT"),
			S3Bucket:   os.Getenv("S3_BUCKET"),
			S3Key:      os.Getenv("S3_ACCESS_KEY"),
			S3Secret:   os.Getenv("S3_SECRET_KEY"),
			S3Region:   os.Getenv("S3_REGION"),
		},
		OrganizerEmails: splitCSVEmails(os.Getenv("ORGANIZER_EMAILS")),
	}
}

func splitCSVEmails(raw string) []string {
	if strings.TrimSpace(raw) == "" {
		return []string{}
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		email := strings.ToLower(strings.TrimSpace(p))
		if email == "" {
			continue
		}
		out = append(out, email)
	}
	return out
}
