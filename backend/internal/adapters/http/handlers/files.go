package http

import (
	"bytes"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"confsite/backend/internal/app/services"
	"confsite/backend/internal/ports"

	"confsite/backend/internal/lib/files"

	"confsite/backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UploadConsent(st ports.Storage, consentRepo ports.ConsentFileRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)

		// Get consent type from query param or form field
		consentType := c.Query("type")
		if consentType == "" {
			consentType = c.PostForm("type")
		}
		if consentType == "" || (consentType != "DATA_PROCESSING" && consentType != "DATA_TRANSFER") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid consent type"})
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

		key := "consents/" + uid.String() + "/" + consentType + "/" + safeName(fh.Filename)
		if err := st.Put(c, key, bytes.NewReader(data), int64(len(data)), mimeType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
			return
		}
		url := st.PublicURL(key)

		// Save to database
		size := int64(len(data))
		if err := consentRepo.Upsert(c, uid, consentType, url, &size, &mimeType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "save failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true, "key": key, "url": url})
	}
}

func UploadTalkFile(st ports.Storage, talkSvc *services.TalkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		tid := uuid.MustParse(c.Param("id"))

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

		data, _ := io.ReadAll(io.LimitReader(f, 12<<20)) // 12MB hard cap
		_, err = files.SniffAndValidate(fh.Filename, data, files.FileCheck{
			MaxBytes: 10 << 20,
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

		key := "talks/" + tid.String() + "/" + safeName(fh.Filename)
		if err := st.Put(c, key, bytes.NewReader(data), int64(len(data)), fh.Header.Get("Content-Type")); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
			return
		}
		fileURL := st.PublicURL(key)

		// persist file URL and notify emails (org + user)
		if err := talkSvc.SetFileURL(c, uid, tid, fileURL, ctxLang(c)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true, "key": key, "url": fileURL})
	}
}

func safeName(name string) string {
	name = filepath.Base(name)
	name = strings.ReplaceAll(name, " ", "_")
	return name
}
