package repos

import (
	"context"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ConsentFileRepo struct {
	db *pgxpool.Pool
	q  *sqlc.Queries
}

func NewConsentFileRepo(db *pgxpool.Pool) *ConsentFileRepo {
	return &ConsentFileRepo{db: db, q: sqlc.New(db)}
}

func (r *ConsentFileRepo) Create(ctx context.Context, cf domain.ConsentFile) error {
	var fileSize pgtype.Int8
	if cf.FileSize != nil {
		fileSize = pgtype.Int8{Int64: *cf.FileSize, Valid: true}
	}
	var mimeType pgtype.Text
	if cf.MimeType != nil {
		mimeType = pgtype.Text{String: *cf.MimeType, Valid: true}
	}
	return r.q.CreateConsentFile(ctx, sqlc.CreateConsentFileParams{
		UserID:      cf.UserID,
		ConsentType: string(cf.ConsentType),
		FileUrl:     cf.FileURL,
		FileSize:    fileSize,
		MimeType:    mimeType,
	})
}

func (r *ConsentFileRepo) Upsert(ctx context.Context, userID uuid.UUID, consentType string, fileURL string, fileSize *int64, mimeType *string) error {
	var fs pgtype.Int8
	if fileSize != nil {
		fs = pgtype.Int8{Int64: *fileSize, Valid: true}
	}
	var mt pgtype.Text
	if mimeType != nil {
		mt = pgtype.Text{String: *mimeType, Valid: true}
	}
	// CreateConsentFile already has ON CONFLICT, so we can reuse it for upsert
	return r.q.CreateConsentFile(ctx, sqlc.CreateConsentFileParams{
		UserID:      userID,
		ConsentType: consentType,
		FileUrl:     fileURL,
		FileSize:    fs,
		MimeType:    mt,
	})
}

func (r *ConsentFileRepo) Get(ctx context.Context, userID uuid.UUID, consentType domain.ConsentType) (*domain.ConsentFile, error) {
	row, err := r.q.GetConsentFile(ctx, sqlc.GetConsentFileParams{
		UserID:      userID,
		ConsentType: string(consentType),
	})
	if err != nil {
		return nil, err
	}
	
	var fileSize *int64
	if row.FileSize.Valid {
		fileSize = &row.FileSize.Int64
	}
	var mimeType *string
	if row.MimeType.Valid {
		mimeType = &row.MimeType.String
	}
	
	return &domain.ConsentFile{
		ID:          row.ID,
		UserID:      row.UserID,
		ConsentType: domain.ConsentType(row.ConsentType),
		FileURL:     row.FileUrl,
		FileSize:    fileSize,
		MimeType:    mimeType,
		UploadedAt:  row.UploadedAt,
	}, nil
}

func (r *ConsentFileRepo) ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.ConsentFile, error) {
	rows, err := r.q.GetConsentFilesByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	var result []domain.ConsentFile
	for _, row := range rows {
		var fileSize *int64
		if row.FileSize.Valid {
			fileSize = &row.FileSize.Int64
		}
		var mimeType *string
		if row.MimeType.Valid {
			mimeType = &row.MimeType.String
		}
		
		result = append(result, domain.ConsentFile{
			ID:          row.ID,
			UserID:      row.UserID,
			ConsentType: domain.ConsentType(row.ConsentType),
			FileURL:     row.FileUrl,
			FileSize:    fileSize,
			MimeType:    mimeType,
			UploadedAt:  row.UploadedAt,
		})
	}
	return result, nil
}

func (r *ConsentFileRepo) Delete(ctx context.Context, userID uuid.UUID, consentType domain.ConsentType) error {
	return r.q.DeleteConsentFile(ctx, sqlc.DeleteConsentFileParams{
		UserID:      userID,
		ConsentType: string(consentType),
	})
}
