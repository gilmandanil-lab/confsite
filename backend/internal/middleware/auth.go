package middleware

import (
	"net/http"

	"confsite/backend/internal/lib/auth"

	"github.com/gin-gonic/gin"
)

const (
	CtxUserIDKey = "userID"
	CtxRolesKey  = "roles"
)

type AuthConfig struct {
	JWTSecret []byte
}

func Auth(cfg AuthConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("access_token")
		if err != nil || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		claims, err := auth.ParseAccessJWT(cfg.JWTSecret, token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		c.Set(CtxUserIDKey, claims.UserID)
		c.Set(CtxRolesKey, claims.Roles)
		c.Next()
	}
}

func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roles, _ := c.Get(CtxRolesKey)
		rs, _ := roles.([]string)
		for _, r := range rs {
			if r == role {
				c.Next()
				return
			}
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
	}
}
