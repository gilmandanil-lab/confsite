package http

import (
	"confsite/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func ctxLang(c *gin.Context) string {
	lang := c.GetString(middleware.CtxLangKey)
	if lang == "" {
		lang = "ru"
	}
	return lang
}
