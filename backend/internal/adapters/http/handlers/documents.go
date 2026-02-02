package http

import (
	"bytes"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"confsite/backend/internal/lib/files"
	"confsite/backend/internal/middleware"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AdminUploadDocumentTemplate(st ports.Storage, docRepo ports.DocumentsRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		docType := c.PostForm("type")
		if docType == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "type required"})
			return
		}

		// Validate document type
		if docType != "CONSENT_DATA_PROCESSING" && docType != "CONSENT_DATA_TRANSFER" && docType != "LICENSE_AGREEMENT" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid document type"})
			return
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

		data, _ := io.ReadAll(io.LimitReader(f, 6<<20)) // 6MB hard cap
		mimeType, err := files.SniffAndValidate(fh.Filename, data, files.FileCheck{
			MaxBytes: 5 << 20,
			Allowed: map[string]bool{
				"application/pdf":    true,
				"application/msword": true,
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
			},
		})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		key := "documents/" + docType + "/" + safeName(fh.Filename)
		if err := st.Put(c, key, bytes.NewReader(data), int64(len(data)), mimeType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
			return
		}
		url := st.PublicURL(key)

		// Save to database
		size := int64(len(data))
		name := strings.TrimSuffix(fh.Filename, filepath.Ext(fh.Filename))
		if err := docRepo.UpsertTemplate(c, name, "", docType, url, &size, &mimeType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "save failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true, "url": url})
	}
}

func AdminListDocumentTemplates(docRepo ports.DocumentsRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		templates, err := docRepo.ListTemplates(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, templates)
	}
}

func PublicListDocumentTemplates(docRepo ports.DocumentsRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		templates, err := docRepo.ListTemplates(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, templates)
	}
}

func UploadSignedDocument(st ports.Storage, docRepo ports.DocumentsRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)

		docType := c.PostForm("type")
		if docType == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "type required"})
			return
		}

		// Validate document type
		if docType != "CONSENT_DATA_PROCESSING" && docType != "CONSENT_DATA_TRANSFER" && docType != "LICENSE_AGREEMENT" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid document type"})
			return
		}

		talkIDStr := c.PostForm("talk_id")
		var talkID *uuid.UUID
		if talkIDStr != "" {
			tid, err := uuid.Parse(talkIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid talk_id"})
				return
			}
			talkID = &tid
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

		data, _ := io.ReadAll(io.LimitReader(f, 6<<20)) // 6MB hard cap
		mimeType, err := files.SniffAndValidate(fh.Filename, data, files.FileCheck{
			MaxBytes: 5 << 20,
			Allowed: map[string]bool{
				"application/pdf":    true,
				"application/msword": true,
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
			},
		})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		keyPrefix := "documents/signed/" + uid.String()
		if talkID != nil {
			keyPrefix = keyPrefix + "/" + talkID.String()
		}
		key := keyPrefix + "/" + docType + "/" + safeName(fh.Filename)

		if err := st.Put(c, key, bytes.NewReader(data), int64(len(data)), mimeType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
			return
		}
		url := st.PublicURL(key)

		// Save to database
		size := int64(len(data))
		if err := docRepo.UpsertSignedDoc(c, uid, talkID, docType, url, &size, &mimeType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "save failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true, "url": url})
	}
}
