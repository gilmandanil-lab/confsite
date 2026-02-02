package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

const CtxLangKey = "lang"

func Locale() gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := strings.ToLower(c.Query("lang"))
		if lang != "en" && lang != "ru" {
			lang = "ru"
		}
		c.Set(CtxLangKey, lang)
		c.Next()
	}
}
