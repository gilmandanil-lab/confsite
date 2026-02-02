package http

import (
	"net/http"
	"strings"
	"time"

	"confsite/backend/internal/adapters/http/dto"
	"confsite/backend/internal/app/services"

	"github.com/gin-gonic/gin"
)

func Register(s *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req dto.RegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := s.Register(c, req.Email, req.Password, ctxLang(c)); err != nil {
			// Check if it's a duplicate email error
			if strings.Contains(err.Error(), "users_email_key") || strings.Contains(err.Error(), "duplicate key") {
				c.JSON(http.StatusConflict, gin.H{"error": "email_already_exists"})
				return
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func Login(s *services.AuthService, cfg services.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req dto.LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		issued, err := s.Login(c, req.Email, req.Password, ctxLang(c))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		setAuthCookies(c, issued, cfg)
		c.JSON(http.StatusOK, gin.H{
			"ok":     true,
			"userId": issued.UserID,
			"roles":  issued.Roles,
			"status": issued.Status,
			"email":  issued.Email,
		})
	}
}

func Refresh(s *services.AuthService, cfg services.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		refresh, err := c.Cookie("refresh_token")
		if err != nil || refresh == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		issued, err := s.Refresh(c, refresh)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		setAuthCookies(c, issued, cfg)
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func Logout(s *services.AuthService, cfg services.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		refresh, _ := c.Cookie("refresh_token")
		_ = s.Logout(c, refresh)
		clearAuthCookies(c, cfg)
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func VerifyEmail(s *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Query("token")
		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "token required"})
			return
		}
		if err := s.VerifyEmail(c, token); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func setAuthCookies(c *gin.Context, issued *services.IssuedTokens, cfg services.AppConfig) {
	accessAge := int(time.Until(issued.AccessExp).Seconds())
	if accessAge < 0 {
		accessAge = 0
	}
	refreshAge := int(time.Until(issued.RefreshExp).Seconds())
	if refreshAge < 0 {
		refreshAge = 0
	}
	c.SetCookie("access_token", issued.AccessToken, accessAge, "/", cfg.CookieDomain, cfg.CookieSecure, true)
	c.SetCookie("refresh_token", issued.RefreshToken, refreshAge, "/", cfg.CookieDomain, cfg.CookieSecure, true)
}

func clearAuthCookies(c *gin.Context, cfg services.AppConfig) {
	c.SetCookie("access_token", "", -1, "/", cfg.CookieDomain, cfg.CookieSecure, true)
	c.SetCookie("refresh_token", "", -1, "/", cfg.CookieDomain, cfg.CookieSecure, true)
}
