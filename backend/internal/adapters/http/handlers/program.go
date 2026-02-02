package http

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"path/filepath"

	"confsite/backend/internal/lib/files"
	"confsite/backend/internal/middleware"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func PublicProgramFile(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id, filename, filepath, mimeType string
		var uploadedAt string
		
		err := pool.QueryRow(c, 
			`SELECT id, filename, file_path, mime_type, uploaded_at FROM program_files ORDER BY uploaded_at DESC LIMIT 1`,
		).Scan(&id, &filename, &filepath, &mimeType, &uploadedAt)
		
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id":         id,
			"filename":   filename,
			"file_path":  filepath,
			"mime_type":  mimeType,
			"uploaded_at": uploadedAt,
		})
	}
}

func AdminUploadProgramFile(st ports.Storage, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)

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

		data, _ := io.ReadAll(io.LimitReader(f, 51<<20)) // 51MB hard cap
		mimeType, err := files.SniffAndValidate(fh.Filename, data, files.FileCheck{
			MaxBytes: 50 << 20, // 50MB
			Allowed: map[string]bool{
				"application/pdf": true,
				"application/msword": true,
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
			},
		})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Upload file
		fileID := uuid.New()
		filename := fileID.String() + filepath.Ext(fh.Filename)
		err = st.Put(c, filename, bytes.NewReader(data), int64(len(data)), mimeType)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
			return
		}
		
		fileURL := st.PublicURL(filename)

		// Delete old program file if exists
		_, _ = pool.Exec(context.Background(), `DELETE FROM program_files`)

		// Insert new program file
		_, err = pool.Exec(context.Background(),
			`INSERT INTO program_files (filename, file_path, file_size, mime_type, uploaded_by) 
			 VALUES ($1, $2, $3, $4, $5)`,
			fh.Filename, fileURL, len(data), mimeType, uid,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"filename":   fh.Filename,
			"file_path":  fileURL,
			"file_size":  len(data),
			"mime_type":  mimeType,
		})
	}
}

func AdminDeleteProgramFile(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := pool.Exec(context.Background(), `DELETE FROM program_files`)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true})
	}
}
