package repos

import (
	"context"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MaterialsRepo struct {
	q  *sqlc.Queries
	db *pgxpool.Pool
}

func NewMaterialsRepo(db *pgxpool.Pool) *MaterialsRepo {
	return &MaterialsRepo{q: sqlc.New(db), db: db}
}

func toDomainMaterial(m sqlc.Material) domain.Material {
	result := domain.Material{
		ID:        m.ID,
		Type:      domain.MaterialType(m.Type),
		TitleRu:   m.TitleRu,
		TitleEn:   m.TitleEn,
		FileURL:   m.FileUrl,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}

	if m.DescriptionRu.Valid {
		result.DescriptionRu = &m.DescriptionRu.String
	}
	if m.DescriptionEn.Valid {
		result.DescriptionEn = &m.DescriptionEn.String
	}
	if m.FileSize.Valid {
		result.FileSize = &m.FileSize.Int64
	}
	if m.MimeType.Valid {
		result.MimeType = &m.MimeType.String
	}
	if m.UploadedBy.Valid {
		id := uuid.UUID(m.UploadedBy.Bytes)
		result.UploadedBy = &id
	}

	return result
}

func (r *MaterialsRepo) List(ctx context.Context) ([]domain.Material, error) {
	ms, err := r.q.ListMaterials(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]domain.Material, 0, len(ms))
	for _, m := range ms {
		out = append(out, toDomainMaterial(m))
	}
	return out, nil
}

func (r *MaterialsRepo) ListByType(ctx context.Context, materialType domain.MaterialType) ([]domain.Material, error) {
	ms, err := r.q.ListMaterialsByType(ctx, string(materialType))
	if err != nil {
		return nil, err
	}
	out := make([]domain.Material, 0, len(ms))
	for _, m := range ms {
		out = append(out, toDomainMaterial(m))
	}
	return out, nil
}

func (r *MaterialsRepo) Get(ctx context.Context, id uuid.UUID) (*domain.Material, error) {
	m, err := r.q.GetMaterial(ctx, id)
	if err != nil {
		return nil, err
	}
	result := toDomainMaterial(m)
	return &result, nil
}

func (r *MaterialsRepo) Create(ctx context.Context, m domain.Material) (uuid.UUID, error) {
	id := uuid.New()
	err := r.db.QueryRow(ctx, `
INSERT INTO materials (id, type, title_ru, title_en, description_ru, description_en, file_url, file_size, mime_type, uploaded_by)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id`,
		id, m.Type, m.TitleRu, m.TitleEn, m.DescriptionRu, m.DescriptionEn, m.FileURL, m.FileSize, m.MimeType, m.UploadedBy).Scan(&id)
	return id, err
}

func (r *MaterialsRepo) Update(ctx context.Context, m domain.Material) error {
	_, err := r.db.Exec(ctx, `
UPDATE materials
SET type=$2, title_ru=$3, title_en=$4, description_ru=$5, description_en=$6, file_url=$7, file_size=$8, mime_type=$9, updated_at=now()
WHERE id=$1`,
		m.ID, m.Type, m.TitleRu, m.TitleEn, m.DescriptionRu, m.DescriptionEn, m.FileURL, m.FileSize, m.MimeType)
	return err
}

func (r *MaterialsRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM materials WHERE id=$1`, id)
	return err
}
