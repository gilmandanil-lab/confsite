package http

import (
	"net/http"

	"confsite/backend/internal/app/services"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func PublicPage(s *services.PageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := ctxLang(c)
		slug := c.Param("slug")
		p, err := s.Get(c, slug)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		if lang == "en" {
			c.JSON(http.StatusOK, gin.H{"title": p.TitleEn, "body": p.BodyEn})
		} else {
			c.JSON(http.StatusOK, gin.H{"title": p.TitleRu, "body": p.BodyRu})
		}
	}
}

func PublicNewsList(s *services.NewsService) gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := ctxLang(c)
		rows, err := s.List(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		out := make([]gin.H, 0, len(rows))
		for _, n := range rows {
			if lang == "en" {
				out = append(out, gin.H{"id": n.ID, "title": n.TitleEn, "body": n.BodyEn, "pinned": n.Pinned, "publishedAt": n.PublishedAt})
			} else {
				out = append(out, gin.H{"id": n.ID, "title": n.TitleRu, "body": n.BodyRu, "pinned": n.Pinned, "publishedAt": n.PublishedAt})
			}
		}
		c.JSON(http.StatusOK, out)
	}
}

func PublicNewsGet(s *services.NewsService) gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := ctxLang(c)
		id := uuid.MustParse(c.Param("id"))
		n, err := s.Get(c, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		if lang == "en" {
			c.JSON(http.StatusOK, gin.H{"id": n.ID, "title": n.TitleEn, "body": n.BodyEn, "pinned": n.Pinned, "publishedAt": n.PublishedAt})
		} else {
			c.JSON(http.StatusOK, gin.H{"id": n.ID, "title": n.TitleRu, "body": n.BodyRu, "pinned": n.Pinned, "publishedAt": n.PublishedAt})
		}
	}
}

func PublicParticipants(p ports.ProfileRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := p.ListApprovedPublic(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		out := make([]gin.H, 0, len(rows))
		for _, r := range rows {
			out = append(out, gin.H{"fullName": r.FullName, "affiliation": r.Affiliation, "city": r.City})
		}
		c.JSON(http.StatusOK, out)
	}
}

func PublicSections(s ports.SectionRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := ctxLang(c)
		rows, err := s.List(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		out := make([]gin.H, 0, len(rows))
		for _, r := range rows {
			title := r.TitleRu
			if lang == "en" {
				title = r.TitleEn
			}
			out = append(out, gin.H{"id": r.ID, "title": title, "titleRu": r.TitleRu, "titleEn": r.TitleEn})
		}
		c.JSON(http.StatusOK, out)
	}
}

func PublicProgram(t ports.TalkRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := t.ListAdmin(c, nil, false)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		out := make([]any, 0, len(rows))
		for _, row := range rows {
			if row.Status == "APPROVED" {
				out = append(out, row)
			}
		}
		c.JSON(http.StatusOK, out)
	}
}
