package http

import (
	"net/http"

	"confsite/backend/internal/adapters/http/dto"
	"confsite/backend/internal/middleware"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func Me(users ports.UserRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet(middleware.CtxUserIDKey).(uuid.UUID)
		u, roles, err := users.ByID(c, uid)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		rs := make([]string, 0, len(roles))
		for _, r := range roles {
			rs = append(rs, string(r.Role))
		}
		c.JSON(http.StatusOK, dto.MeResponse{
			ID:     u.ID.String(),
			Email:  u.Email,
			Status: string(u.Status),
			Roles:  rs,
		})
	}
}
