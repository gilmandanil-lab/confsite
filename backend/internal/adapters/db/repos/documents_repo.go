package repos

import (
	"context"

	"confsite/backend/internal/ports"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/google/uuid"
)

type DocumentsRepo struct {
	db *pgxpool.Pool
}

func NewDocumentsRepo(db *pgxpool.Pool) ports.DocumentsRepo {
	return &DocumentsRepo{db}
}

func (r *DocumentsRepo) UpsertTemplate(ctx context.Context, name, desc, docType, fileURL string, size *int64, mimeType *string) error {
	tag, err := r.db.Exec(ctx, `
UPDATE document_templates
SET
  name = $1,
  description = $2,
  file_url = $4,
  file_size = $5,
  mime_type = $6,
  version = version + 1,
  updated_at = now()
WHERE document_type = $3`,
		name, desc, docType, fileURL, size, mimeType)
	if err != nil {
		return err
	}
	if tag.RowsAffected() > 0 {
		return nil
	}

	_, err = r.db.Exec(ctx, `
INSERT INTO document_templates (name, description, document_type, file_url, file_size, mime_type, version)
VALUES ($1, $2, $3, $4, $5, $6, 1)`,
		name, desc, docType, fileURL, size, mimeType)
	return err
}

func (r *DocumentsRepo) GetTemplate(ctx context.Context, docType string) (*ports.DocumentTemplate, error) {
	var dt ports.DocumentTemplate
	err := r.db.QueryRow(ctx, `
SELECT id, name, description, document_type, file_url, file_size, mime_type, version, is_active, created_at, updated_at
FROM document_templates
WHERE document_type = $1 AND is_active = true
ORDER BY version DESC
LIMIT 1`, docType).Scan(
		&dt.ID, &dt.Name, &dt.Description, &dt.DocumentType, &dt.FileURL, 
		&dt.FileSize, &dt.MimeType, &dt.Version, &dt.IsActive, &dt.CreatedAt, &dt.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &dt, nil
}

func (r *DocumentsRepo) ListTemplates(ctx context.Context) ([]ports.DocumentTemplate, error) {
	rows, err := r.db.Query(ctx, `
SELECT id, name, description, document_type, file_url, file_size, mime_type, version, is_active, created_at, updated_at
FROM document_templates
WHERE is_active = true
ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []ports.DocumentTemplate
	for rows.Next() {
		var dt ports.DocumentTemplate
		if err := rows.Scan(
			&dt.ID, &dt.Name, &dt.Description, &dt.DocumentType, &dt.FileURL,
			&dt.FileSize, &dt.MimeType, &dt.Version, &dt.IsActive, &dt.CreatedAt, &dt.UpdatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, dt)
	}
	return results, rows.Err()
}

func (r *DocumentsRepo) UpsertSignedDoc(ctx context.Context, userID uuid.UUID, talkID *uuid.UUID, docType, fileURL string, size *int64, mimeType *string) error {
	_, err := r.db.Exec(ctx, `
INSERT INTO signed_documents (user_id, talk_id, document_type, file_url, file_size, mime_type)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (user_id, talk_id, document_type) DO UPDATE SET
  file_url = $4,
  file_size = $5,
  mime_type = $6,
  uploaded_at = now()`,
		userID, talkID, docType, fileURL, size, mimeType)
	return err
}

func (r *DocumentsRepo) GetSignedDoc(ctx context.Context, userID uuid.UUID, talkID *uuid.UUID, docType string) (*ports.SignedDocument, error) {
	var sd ports.SignedDocument
	err := r.db.QueryRow(ctx, `
SELECT id, user_id, talk_id, document_type, file_url, file_size, mime_type, uploaded_at
FROM signed_documents
WHERE user_id = $1 AND talk_id = $2 AND document_type = $3`,
		userID, talkID, docType).Scan(
		&sd.ID, &sd.UserID, &sd.TalkID, &sd.DocumentType, &sd.FileURL,
		&sd.FileSize, &sd.MimeType, &sd.UploadedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sd, nil
}

func (r *DocumentsRepo) ListUserSignedDocs(ctx context.Context, userID uuid.UUID) ([]ports.SignedDocument, error) {
	rows, err := r.db.Query(ctx, `
SELECT id, user_id, talk_id, document_type, file_url, file_size, mime_type, uploaded_at
FROM signed_documents
WHERE user_id = $1
ORDER BY uploaded_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []ports.SignedDocument
	for rows.Next() {
		var sd ports.SignedDocument
		if err := rows.Scan(
			&sd.ID, &sd.UserID, &sd.TalkID, &sd.DocumentType, &sd.FileURL,
			&sd.FileSize, &sd.MimeType, &sd.UploadedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, sd)
	}
	return results, rows.Err()
}
