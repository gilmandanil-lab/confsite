package ports

import (
	"context"
	"time"

	"confsite/backend/internal/domain"

	"github.com/google/uuid"
)

type UserRepo interface {
	Create(ctx context.Context, email, passwordHash string) (uuid.UUID, error)
	ByEmail(ctx context.Context, email string) (*domain.User, []domain.RoleAssignment, error)
	ByID(ctx context.Context, id uuid.UUID) (*domain.User, []domain.RoleAssignment, error)
	SetEmailVerified(ctx context.Context, id uuid.UUID, verified bool) error
	SetStatus(ctx context.Context, id uuid.UUID, status domain.UserStatus) error
	SetPassword(ctx context.Context, id uuid.UUID, passwordHash string) error

	AssignRole(ctx context.Context, userID uuid.UUID, role domain.Role, sectionID *uuid.UUID) error
	RemoveRole(ctx context.Context, userID uuid.UUID, role domain.Role, sectionID *uuid.UUID) error
	ListUsers(ctx context.Context) ([]domain.UserWithRoles, error)
}

type SessionRepo interface {
	Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error
	ByTokenHash(ctx context.Context, tokenHash string) (*domain.RefreshSession, error)
	Revoke(ctx context.Context, sessionID uuid.UUID) error
}

type ProfileRepo interface {
	Upsert(ctx context.Context, p domain.Profile) error
	Get(ctx context.Context, userID uuid.UUID) (*domain.Profile, error)
	ListApprovedPublic(ctx context.Context) ([]domain.PublicParticipant, error)
}

type ConsentFileRepo interface {
	Create(ctx context.Context, cf domain.ConsentFile) error
	Upsert(ctx context.Context, userID uuid.UUID, consentType string, fileURL string, fileSize *int64, mimeType *string) error
	Get(ctx context.Context, userID uuid.UUID, consentType domain.ConsentType) (*domain.ConsentFile, error)
	ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.ConsentFile, error)
	Delete(ctx context.Context, userID uuid.UUID, consentType domain.ConsentType) error
}

type SectionRepo interface {
	List(ctx context.Context) ([]domain.Section, error)
	Create(ctx context.Context, titleRu, titleEn string, sortOrder int32) error
}

type TalkRepo interface {
	Create(ctx context.Context, t domain.Talk) (uuid.UUID, error)
	Update(ctx context.Context, t domain.Talk) error
	Delete(ctx context.Context, id uuid.UUID, speakerID uuid.UUID) error
	Get(ctx context.Context, id uuid.UUID) (*domain.Talk, error)
	ListBySpeaker(ctx context.Context, speakerID uuid.UUID) ([]domain.Talk, error)
	CountBySpeaker(ctx context.Context, speakerID uuid.UUID) (int64, error)
	ListAdmin(ctx context.Context, sectionID *uuid.UUID, onlyPlenary bool) ([]domain.AdminTalkRow, error)
	UpdateSchedule(ctx context.Context, talkID uuid.UUID, sectionID *uuid.UUID, scheduleTime *time.Time) error
	UpdateFile(ctx context.Context, talkID uuid.UUID, fileURL string) error
}

type PageRepo interface {
	GetBySlug(ctx context.Context, slug string) (*domain.PageContent, error)
	Upsert(ctx context.Context, p domain.PageContent) error
	List(ctx context.Context) ([]domain.PageContent, error)
}

type NewsRepo interface {
	List(ctx context.Context) ([]domain.News, error)
	Get(ctx context.Context, id uuid.UUID) (*domain.News, error)
	Create(ctx context.Context, n domain.News) (uuid.UUID, error)
	Update(ctx context.Context, n domain.News) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type AuditRepo interface {
	Insert(ctx context.Context, entry domain.AuditLog) error
	List(ctx context.Context, limit int32) ([]domain.AuditLog, error)
}

type MaterialRepo interface {
	List(ctx context.Context) ([]domain.Material, error)
	ListByType(ctx context.Context, materialType domain.MaterialType) ([]domain.Material, error)
	Get(ctx context.Context, id uuid.UUID) (*domain.Material, error)
	Create(ctx context.Context, m domain.Material) (uuid.UUID, error)
	Update(ctx context.Context, m domain.Material) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type DocumentsRepo interface {
	UpsertTemplate(ctx context.Context, name, description, docType, fileURL string, size *int64, mimeType *string) error
	GetTemplate(ctx context.Context, docType string) (*DocumentTemplate, error)
	ListTemplates(ctx context.Context) ([]DocumentTemplate, error)
	UpsertSignedDoc(ctx context.Context, userID uuid.UUID, talkID *uuid.UUID, docType, fileURL string, size *int64, mimeType *string) error
	GetSignedDoc(ctx context.Context, userID uuid.UUID, talkID *uuid.UUID, docType string) (*SignedDocument, error)
	ListUserSignedDocs(ctx context.Context, userID uuid.UUID) ([]SignedDocument, error)
}

type DocumentTemplate struct {
	ID           uuid.UUID
	Name         string
	Description  *string
	DocumentType string
	FileURL      string
	FileSize     *int64
	MimeType     *string
	Version      int
	IsActive     bool
	CreatedAt    string
	UpdatedAt    string
}

type SignedDocument struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	TalkID       *uuid.UUID
	DocumentType string
	FileURL      string
	FileSize     *int64
	MimeType     *string
	UploadedAt   string
}