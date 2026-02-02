package http

import (
	"crypto/rand"
	"math/big"
	"net/http"

	"confsite/backend/internal/app/services"
	"confsite/backend/internal/domain"
	"confsite/backend/internal/lib/auth"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ApproveUserHandler(s *services.AdminService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.MustParse(c.Param("id"))
		if err := s.SetUserStatus(c, id, domain.StatusApproved, ctxLang(c)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "APPROVED"})
	}
}

func ResetUserPasswordHandler(r ports.UserRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			UserID string `json:"userId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Generate random password
		password := generateRandomPassword(12)

		// Parse user ID
		userID, err := uuid.Parse(req.UserID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
			return
		}

		// Hash password
		hash, err := auth.HashPassword(password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
			return
		}

		// Update user password
		if err := r.SetPassword(c, userID, hash); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"password": password})
	}
}

func generateRandomPassword(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
	b := make([]byte, length)
	for i := range b {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		b[i] = charset[num.Int64()]
	}
	return string(b)
}
