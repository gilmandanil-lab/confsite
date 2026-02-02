package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
)

const CtxAuditMetaKey = "auditMeta"

type AuditMeta struct {
	IP        string
	UserAgent string
	StartedAt time.Time
}

func Audit() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(CtxAuditMetaKey, AuditMeta{
			IP:        c.ClientIP(),
			UserAgent: c.GetHeader("User-Agent"),
			StartedAt: time.Now(),
		})
		c.Next()
	}
}
