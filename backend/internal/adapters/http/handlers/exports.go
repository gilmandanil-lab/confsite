package http

import (
	"net/http"

	"confsite/backend/internal/app/services"

	"github.com/gin-gonic/gin"
)

func ExportParticipantsCSV(s *services.ExportService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// ADMIN only; include email
		b, err := s.ParticipantsCSV(c, true)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		c.Header("Content-Type", "text/csv; charset=utf-8")
		c.Header("Content-Disposition", `attachment; filename="participants.csv"`)
		c.Data(http.StatusOK, "text/csv; charset=utf-8", b)
	}
}

func ExportParticipantsXLSX(s *services.ExportService) gin.HandlerFunc {
	return func(c *gin.Context) {
		b, err := s.ParticipantsXLSX(c, true)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		c.Header("Content-Disposition", `attachment; filename="participants.xlsx"`)
		c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b)
	}
}

func ExportTalksBySectionXLSX(s *services.ExportService) gin.HandlerFunc {
	return func(c *gin.Context) {
		b, err := s.TalksBySectionXLSX(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		c.Header("Content-Disposition", `attachment; filename="talks_by_section.xlsx"`)
		c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b)
	}
}
