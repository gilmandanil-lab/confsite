package http

import (
	"encoding/json"
	"net/http"

	"confsite/backend/internal/adapters/http/dto"
	"confsite/backend/internal/app/services"
	"confsite/backend/internal/domain"
	"confsite/backend/internal/middleware"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetProfile(p ports.ProfileRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		prof, err := p.Get(c, uid)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusOK, prof)
	}
}

func PutProfile(p ports.ProfileRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		var prof domain.Profile
		if err := c.ShouldBindJSON(&prof); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		prof.UserID = uid
		if err := p.Upsert(c, prof); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func ListMyTalks(s *services.TalkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		rows, err := s.ListMine(c, uid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		out := make([]gin.H, 0, len(rows))
		for _, t := range rows {
			out = append(out, gin.H{
				"id":          t.ID,
				"title":       t.Title,
				"kind":        t.Kind,
				"status":      t.Status,
				"sectionId":   t.SectionID,
				"affiliation": t.Affiliation,
				"abstract":    t.Abstract,
				"fileUrl":     t.FileURL,
				"authors":     json.RawMessage(t.AuthorsJSON),
			})
		}
		c.JSON(http.StatusOK, out)
	}
}

func CreateTalk(s *services.TalkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		var req dto.TalkUpsertRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		authors, _ := json.Marshal(req.Authors)
		id, err := s.Create(c, uid, domain.Talk{
			SectionID:   req.SectionID,
			Title:       req.Title,
			Affiliation: req.Affiliation,
			Abstract:    req.Abstract,
			Kind:        domain.TalkKind(req.Kind),
			AuthorsJSON: authors,
		})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": id})
	}
}

func GetMyTalk(s *services.TalkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		tid := uuid.MustParse(c.Param("id"))
		t, err := s.GetMine(c, uid, tid)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"id":          t.ID,
			"title":       t.Title,
			"kind":        t.Kind,
			"status":      t.Status,
			"sectionId":   t.SectionID,
			"affiliation": t.Affiliation,
			"abstract":    t.Abstract,
			"fileUrl":     t.FileURL,
			"authors":     json.RawMessage(t.AuthorsJSON),
		})
	}
}

func UpdateTalk(s *services.TalkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		tid := uuid.MustParse(c.Param("id"))
		var req dto.TalkUpsertRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		authors, _ := json.Marshal(req.Authors)
		err := s.Update(c, uid, domain.Talk{
			ID:          tid,
			SectionID:   req.SectionID,
			Title:       req.Title,
			Affiliation: req.Affiliation,
			Abstract:    req.Abstract,
			Kind:        domain.TalkKind(req.Kind),
			AuthorsJSON: authors,
		})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func DeleteTalk(s *services.TalkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		tid := uuid.MustParse(c.Param("id"))
		if err := s.Delete(c, uid, tid); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}
