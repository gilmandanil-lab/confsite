package http

import (
	"net/http"
	"time"

	"confsite/backend/internal/adapters/http/dto"
	"confsite/backend/internal/app/services"
	"confsite/backend/internal/domain"
	"confsite/backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func SubmitRegistration(s *services.RegistrationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)

		var req dto.RegistrationSubmitRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		bd, err := time.Parse("2006-01-02", req.BirthDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad birthDate"})
			return
		}

		p := domain.Profile{
			UserID:                   uid,
			Surname:                  req.Surname,
			Name:                     req.Name,
			Patronymic:               req.Patronymic,
			BirthDate:                bd,
			City:                     req.City,
			AcademicDegree:           req.AcademicDegree,
			Affiliation:              req.Affiliation,
			Position:                 req.Position,
			Phone:                    req.Phone,
			PostalAddress:            req.PostalAddress,
			ConsentDataProcessing:    req.ConsentDataProcessing,
			ConsentDataTransfer:      req.ConsentDataTransfer,
		}

		if err := s.Submit(c, uid, p, ctxLang(c)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}
