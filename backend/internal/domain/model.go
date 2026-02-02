package domain

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleUser         Role = "USER"
	RoleParticipant  Role = "PARTICIPANT"
	RoleAdmin        Role = "ADMIN"
	RoleSectionAdmin Role = "SECTION_ADMIN"
)

type RoleAssignment struct {
	Role      Role
	SectionID *uuid.UUID
}

type UserStatus string

const (
	StatusWaiting  UserStatus = "WAITING"
	StatusApproved UserStatus = "APPROVED"
	StatusRejected UserStatus = "REJECTED"
)

type User struct {
	ID            uuid.UUID
	Email         string
	PasswordHash  string
	EmailVerified bool
	Status        UserStatus
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type UserWithRoles struct {
	User
	Roles []RoleAssignment
}

type Profile struct {
	UserID                   uuid.UUID
	Surname                  string
	Name                     string
	Patronymic               string
	BirthDate                time.Time
	City                     string
	AcademicDegree           *string
	Affiliation              string
	Position                 string
	Phone                    string
	PostalAddress            string
	ConsentDataProcessing    bool
	ConsentDataTransfer      bool
	UpdatedAt                time.Time
}

type ConsentType string

const (
	ConsentDataProcessing ConsentType = "DATA_PROCESSING"
	ConsentDataTransfer   ConsentType = "DATA_TRANSFER"
)

type ConsentFile struct {
	ID          uuid.UUID
	UserID      uuid.UUID
	ConsentType ConsentType
	FileURL     string
	FileSize    *int64
	MimeType    *string
	UploadedAt  time.Time
}

type PublicParticipant struct {
	FullName    string
	Affiliation string
	City        string
}

type Section struct {
	ID        uuid.UUID
	TitleRu   string
	TitleEn   string
	SortOrder int32
}

type TalkKind string

const (
	TalkPlenary TalkKind = "PLENARY"
	TalkOral    TalkKind = "ORAL"
	TalkPoster  TalkKind = "POSTER"
)

type TalkAuthor struct {
	FullName    string `json:"fullName"`
	Affiliation string `json:"affiliation"`
}

type Talk struct {
	ID            uuid.UUID
	SpeakerUserID uuid.UUID
	SectionID     *uuid.UUID
	Title         string
	Affiliation   string
	Abstract      string
	Kind          TalkKind
	AuthorsJSON   []byte // raw jsonb payload
	CreatedAt     time.Time
	FileURL       *string
}

type AdminTalkRow struct {
	ID                 uuid.UUID
	Title              string
	Kind               TalkKind
	SectionID          *uuid.UUID
	ScheduleTime       *time.Time
	FileURL            *string
	SectionTitleRu     *string
	SectionTitleEn     *string
	SpeakerFullName    string
	SpeakerCity        string
	SpeakerAffiliation string
	AuthorsJSON        []byte
	Abstract           string
}

type PageContent struct {
	Slug      string
	TitleRu   string
	BodyRu    string
	TitleEn   string
	BodyEn    string
	UpdatedAt time.Time
}

type News struct {
	ID          uuid.UUID
	TitleRu     string
	BodyRu      string
	TitleEn     string
	BodyEn      string
	Pinned      bool
	PublishedAt time.Time
}

type RefreshSession struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	TokenHash string
	RevokedAt *time.Time
	ExpiresAt time.Time
	CreatedAt time.Time
}

type AuditLog struct {
	ID          uuid.UUID
	ActorUserID *uuid.UUID
	Action      string
	Entity      string
	EntityID    *uuid.UUID
	CreatedAt   time.Time
}
type MaterialType string

const (
	MaterialAbstractTemplate MaterialType = "ABSTRACT_TEMPLATE"
	MaterialLicenseAgreement MaterialType = "LICENSE_AGREEMENT"
	MaterialProceedings      MaterialType = "PROCEEDINGS"
)

type Material struct {
	ID             uuid.UUID
	Type           MaterialType
	TitleRu        string
	TitleEn        string
	DescriptionRu  *string
	DescriptionEn  *string
	FileURL        string
	FileSize       *int64
	MimeType       *string
	UploadedBy     *uuid.UUID
	CreatedAt      time.Time
	UpdatedAt      time.Time
}