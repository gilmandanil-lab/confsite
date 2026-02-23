package http

import (
	"net/http"
	"net/mail"
	"strings"
	"time"

	"confsite/backend/internal/adapters/http/dto"
	"confsite/backend/internal/app/services"
	"confsite/backend/internal/domain"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AdminListUsers(s *services.AdminService) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := s.ListUsersDetailed(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		out := make([]gin.H, 0, len(rows))
		for _, item := range rows {
			u := item.User
			roles := make([]string, 0, len(item.Roles))
			for _, r := range item.Roles {
				roles = append(roles, string(r.Role))
			}
			// profile fields (may be nil)
			var birthDate string
			var academicDegree *string
			var consentDataProcessing bool
			var consentDataTransfer bool
			if item.Profile != nil {
				birthDate = item.Profile.BirthDate.Format(time.RFC3339)
				academicDegree = item.Profile.AcademicDegree
				consentDataProcessing = item.Profile.ConsentDataProcessing
				consentDataTransfer = item.Profile.ConsentDataTransfer
			}
			out = append(out, gin.H{
				"id":     u.ID,
				"email":  u.Email,
				"status": u.Status,
				"roles":  roles,
				"surname": func() string {
					if item.Profile != nil {
						return item.Profile.Surname
					}
					return ""
				}(),
				"name": func() string {
					if item.Profile != nil {
						return item.Profile.Name
					}
					return ""
				}(),
				"patronymic": func() string {
					if item.Profile != nil {
						return item.Profile.Patronymic
					}
					return ""
				}(),
				"birthDate": birthDate,
				"city": func() string {
					if item.Profile != nil {
						return item.Profile.City
					}
					return ""
				}(),
				"academicDegree": academicDegree,
				"affiliation": func() string {
					if item.Profile != nil {
						return item.Profile.Affiliation
					}
					return ""
				}(),
				"position": func() string {
					if item.Profile != nil {
						return item.Profile.Position
					}
					return ""
				}(),
				"phone": func() string {
					if item.Profile != nil {
						return item.Profile.Phone
					}
					return ""
				}(),
				"postalAddress": func() string {
					if item.Profile != nil {
						return item.Profile.PostalAddress
					}
					return ""
				}(),
				"consentDataProcessing": consentDataProcessing,
				"consentDataTransfer":   consentDataTransfer,
			})
		}
		c.JSON(http.StatusOK, out)
	}
}

func AdminSetUserStatus(s *services.AdminService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.MustParse(c.Param("id"))
		var req dto.SetUserStatusRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := s.SetUserStatus(c, id, domain.UserStatus(req.Status), ctxLang(c)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true, "status": req.Status})
	}
}

func AdminSectionsList(sr ports.SectionRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := sr.List(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		c.JSON(http.StatusOK, rows)
	}
}

func AdminSectionsCreate(sr ports.SectionRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req dto.CreateSectionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := sr.Create(c, req.TitleRu, req.TitleEn, req.SortOrder); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminNewsList(ns *services.NewsService) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := ns.List(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		c.JSON(http.StatusOK, rows)
	}
}

func AdminNewsCreate(ns *services.NewsService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req dto.NewsUpsertRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		_, err := ns.Create(c, domain.News{
			TitleRu: req.TitleRu, BodyRu: req.BodyRu,
			TitleEn: req.TitleEn, BodyEn: req.BodyEn,
			Pinned: req.Pinned,
		})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminNewsUpdate(ns *services.NewsService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.MustParse(c.Param("id"))
		var req dto.NewsUpsertRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := ns.Update(c, domain.News{
			ID:      id,
			TitleRu: req.TitleRu, BodyRu: req.BodyRu,
			TitleEn: req.TitleEn, BodyEn: req.BodyEn,
			Pinned: req.Pinned,
		}); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminNewsDelete(ns *services.NewsService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.MustParse(c.Param("id"))
		if err := ns.Delete(c, id); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminPagesList(ps *services.PageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := ps.List(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		c.JSON(http.StatusOK, rows)
	}
}

func AdminPagesUpsert(ps *services.PageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug")
		var req dto.PageUpsertRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := ps.Upsert(c, domain.PageContent{
			Slug:    slug,
			TitleRu: req.TitleRu, BodyRu: req.BodyRu,
			TitleEn: req.TitleEn, BodyEn: req.BodyEn,
		}); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminTalksList(tr ports.TalkRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := tr.ListAdmin(c, nil, false)
		if err != nil {
			println("AdminTalksList error:", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		println("AdminTalksList found", len(rows), "talks")
		c.JSON(http.StatusOK, rows)
	}
}

func AdminUpdateTalk(tr ports.TalkRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.MustParse(c.Param("id"))
		var req dto.AdminUpdateTalkRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var sectionID *uuid.UUID
		if req.SectionID != nil && *req.SectionID != "" {
			uid, err := uuid.Parse(*req.SectionID)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sectionId"})
				return
			}
			sectionID = &uid
		}

		var scheduleTime *time.Time
		if req.ScheduleTime != nil && *req.ScheduleTime != "" {
			// Try multiple formats for schedule time
			formats := []string{
				"2006-01-02T15:04:05Z07:00", // ISO 8601 with timezone
				"2006-01-02T15:04:05",       // ISO 8601 without timezone
				"2006-01-02T15:04",          // Without seconds
			}

			var t time.Time
			var err error
			for _, format := range formats {
				t, err = time.Parse(format, *req.ScheduleTime)
				if err == nil {
					break
				}
			}

			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scheduleTime format: " + *req.ScheduleTime})
				return
			}
			scheduleTime = &t
		}

		if err := tr.UpdateSchedule(c, id, sectionID, scheduleTime); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminSetTalkStatus(s *services.AdminService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.MustParse(c.Param("id"))
		var req dto.SetTalkStatusRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := s.SetTalkStatus(c, id, domain.TalkStatus(req.Status)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true, "status": req.Status})
	}
}

func AdminListSectionResponsibles(sr ports.SectionRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		sections, err := sr.List(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		items, err := sr.ListResponsibleEmails(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		bySection := make(map[uuid.UUID][]string)
		for _, item := range items {
			bySection[item.SectionID] = append(bySection[item.SectionID], item.Email)
		}

		out := make([]gin.H, 0, len(sections))
		for _, s := range sections {
			emails := bySection[s.ID]
			if emails == nil {
				emails = []string{}
			}
			out = append(out, gin.H{
				"sectionId":      s.ID,
				"sectionTitleRu": s.TitleRu,
				"sectionTitleEn": s.TitleEn,
				"emails":         emails,
			})
		}
		c.JSON(http.StatusOK, out)
	}
}

func AdminSetSectionResponsibles(sr ports.SectionRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		sectionID := uuid.MustParse(c.Param("id"))
		var req dto.SetSectionResponsiblesRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		uniq := make(map[string]struct{})
		cleaned := make([]string, 0, len(req.Emails))
		for _, raw := range req.Emails {
			email := strings.ToLower(strings.TrimSpace(raw))
			if email == "" {
				continue
			}
			if _, err := mail.ParseAddress(email); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email: " + raw})
				return
			}
			if _, exists := uniq[email]; exists {
				continue
			}
			uniq[email] = struct{}{}
			cleaned = append(cleaned, email)
		}
		if len(cleaned) > 3 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "max 3 responsibles per section"})
			return
		}

		if err := sr.ReplaceResponsibleEmails(c, sectionID, cleaned); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func AdminAuditList(ar ports.AuditRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := ar.List(c, 200)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		c.JSON(http.StatusOK, rows)
	}
}

func AdminGetUserConsents(cf ports.ConsentFileRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.MustParse(c.Param("id"))
		files, err := cf.ListByUser(c, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error"})
			return
		}
		out := make([]gin.H, 0, len(files))
		for _, f := range files {
			out = append(out, gin.H{
				"id":          f.ID,
				"userId":      f.UserID,
				"consentType": f.ConsentType,
				"fileUrl":     f.FileURL,
				"fileSize":    f.FileSize,
				"mimeType":    f.MimeType,
				"uploadedAt":  f.UploadedAt,
			})
		}
		c.JSON(http.StatusOK, out)
	}
}
