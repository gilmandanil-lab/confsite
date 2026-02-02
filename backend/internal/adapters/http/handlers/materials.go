package http

import (
	"bytes"
	"io"
	"net/http"

	"confsite/backend/internal/domain"
	"confsite/backend/internal/lib/files"
	"confsite/backend/internal/middleware"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MaterialInput struct {
	Type           string `json:"type" binding:"required,oneof=ABSTRACT_TEMPLATE LICENSE_AGREEMENT PROCEEDINGS"`
	TitleRu        string `json:"titleRu" binding:"required"`
	TitleEn        string `json:"titleEn" binding:"required"`
	DescriptionRu  *string `json:"descriptionRu"`
	DescriptionEn  *string `json:"descriptionEn"`
}

type MaterialResponse struct {
	ID             uuid.UUID `json:"id"`
	Type           string    `json:"type"`
	TitleRu        string    `json:"titleRu"`
	TitleEn        string    `json:"titleEn"`
	DescriptionRu  *string   `json:"descriptionRu"`
	DescriptionEn  *string   `json:"descriptionEn"`
	FileURL        string    `json:"fileUrl"`
	FileSize       *int64    `json:"fileSize"`
	MimeType       *string   `json:"mimeType"`
	CreatedAt      string    `json:"createdAt"`
	UpdatedAt      string    `json:"updatedAt"`
}

func PublicMaterialsList(repo ports.MaterialRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		ms, err := repo.List(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch materials"})
			return
		}

		out := make([]MaterialResponse, 0, len(ms))
		for _, m := range ms {
			out = append(out, MaterialResponse{
				ID:             m.ID,
				Type:           string(m.Type),
				TitleRu:        m.TitleRu,
				TitleEn:        m.TitleEn,
				DescriptionRu:  m.DescriptionRu,
				DescriptionEn:  m.DescriptionEn,
				FileURL:        m.FileURL,
				FileSize:       m.FileSize,
				MimeType:       m.MimeType,
				CreatedAt:      m.CreatedAt.String(),
				UpdatedAt:      m.UpdatedAt.String(),
			})
		}

		c.JSON(http.StatusOK, out)
	}
}

func AdminUploadMaterial(st ports.Storage, repo ports.MaterialRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)

		// Parse form data manually since we're handling multipart/form-data with file
		typeVal := c.PostForm("type")
		titleRu := c.PostForm("titleRu")
		titleEn := c.PostForm("titleEn")
		descriptionRu := c.PostForm("descriptionRu")
		descriptionEn := c.PostForm("descriptionEn")

		if typeVal == "" || titleRu == "" || titleEn == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
			return
		}

		input := MaterialInput{
			Type:           typeVal,
			TitleRu:        titleRu,
			TitleEn:        titleEn,
			DescriptionRu:  nil,
			DescriptionEn:  nil,
		}

		if descriptionRu != "" {
			input.DescriptionRu = &descriptionRu
		}
		if descriptionEn != "" {
			input.DescriptionEn = &descriptionEn
		}

		fh, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
			return
		}

		f, err := fh.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad file"})
			return
		}
		defer f.Close()

		data, _ := io.ReadAll(io.LimitReader(f, 50<<20)) // 50MB hard cap
		mimeType, err := files.SniffAndValidate(fh.Filename, data, files.FileCheck{
			MaxBytes: 25 << 20, // 25MB max
			Allowed: map[string]bool{
				"application/pdf":    true,
				"application/msword": true,
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
				"application/vnd.ms-excel": true,
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
				"text/plain": true,
			},
		})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		key := "materials/" + safeName(fh.Filename)
		if err := st.Put(c, key, bytes.NewReader(data), int64(len(data)), mimeType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
			return
		}

		fileSize := int64(len(data))
		m := domain.Material{
			Type:           domain.MaterialType(input.Type),
			TitleRu:        input.TitleRu,
			TitleEn:        input.TitleEn,
			DescriptionRu:  input.DescriptionRu,
			DescriptionEn:  input.DescriptionEn,
			FileURL:        st.PublicURL(key),
			FileSize:       &fileSize,
			MimeType:       &mimeType,
			UploadedBy:     &uid,
		}

		id, err := repo.Create(c, m)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save material"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true, "id": id, "url": st.PublicURL(key)})
	}
}

func AdminDeleteMaterial(st ports.Storage, repo ports.MaterialRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		materialID := uuid.MustParse(c.Param("id"))

		m, err := repo.Get(c, materialID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "material not found"})
			return
		}

		// Delete from storage by extracting key from URL
		// For simplicity, we'll just delete from DB; storage cleanup could be async
		if err := repo.Delete(c, materialID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete material"})
			return
		}

		// Attempt to delete from storage (best effort)
		_ = st.Delete(c, m.FileURL)

		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminUpdateMaterial(repo ports.MaterialRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		materialID := uuid.MustParse(c.Param("id"))

		var input MaterialInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
			return
		}

		m, err := repo.Get(c, materialID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "material not found"})
			return
		}

		m.Type = domain.MaterialType(input.Type)
		m.TitleRu = input.TitleRu
		m.TitleEn = input.TitleEn
		m.DescriptionRu = input.DescriptionRu
		m.DescriptionEn = input.DescriptionEn

		if err := repo.Update(c, *m); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update material"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminListMaterials(repo ports.MaterialRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		ms, err := repo.List(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch materials"})
			return
		}

		out := make([]MaterialResponse, 0, len(ms))
		for _, m := range ms {
			out = append(out, MaterialResponse{
				ID:             m.ID,
				Type:           string(m.Type),
				TitleRu:        m.TitleRu,
				TitleEn:        m.TitleEn,
				DescriptionRu:  m.DescriptionRu,
				DescriptionEn:  m.DescriptionEn,
				FileURL:        m.FileURL,
				FileSize:       m.FileSize,
				MimeType:       m.MimeType,
				CreatedAt:      m.CreatedAt.String(),
				UpdatedAt:      m.UpdatedAt.String(),
			})
		}

		c.JSON(http.StatusOK, out)
	}
}
