package http

import (
	"os"
	"strings"

	"confsite/backend/internal/adapters/db"
	"confsite/backend/internal/adapters/db/repos"
	h "confsite/backend/internal/adapters/http/handlers"
	"confsite/backend/internal/adapters/mail"
	"confsite/backend/internal/adapters/storage"
	"confsite/backend/internal/app/services"
	"confsite/backend/internal/config"
	"confsite/backend/internal/middleware"
	"confsite/backend/internal/ports"

	"github.com/gin-gonic/gin"
)

func NewRouter(cfg config.Config, database *db.DB) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.SecureHeaders())
	r.Use(middleware.Locale())
	r.Use(middleware.Audit())
	origins := []string{}
	if env := os.Getenv("CORS_ORIGINS"); env != "" {
		origins = strings.Split(env, ",")
	} else {
		origins = []string{"http://localhost:5173"}
		if cfg.AppURL != "" {
			origins = append(origins, cfg.AppURL)
		}
	}
	r.Use(middleware.CORS(origins))

	// rate limit for sensitive routes
	authRL := middleware.NewRateLimiter(30, 10) // 30/min burst 10
	regRL := middleware.NewRateLimiter(10, 5)

	// repos
	usersRepo := repos.NewUsersRepo(database.Pool)
	sessionsRepo := repos.NewSessionsRepo(database.Pool)
	emailTokensRepo := repos.NewEmailTokensRepo(database.Pool)
	profilesRepo := repos.NewProfilesRepo(database.Pool)
	sectionsRepo := repos.NewSectionsRepo(database.Pool)
	talksRepo := repos.NewTalksRepo(database.Pool)
	pagesRepo := repos.NewPagesRepo(database.Pool)
	newsRepo := repos.NewNewsRepo(database.Pool)
	auditRepo := repos.NewAuditRepo(database.Pool)
	materialsRepo := repos.NewMaterialsRepo(database.Pool)
	exportsRepo := repos.NewExportsRepo(database.Pool)
	consentRepo := repos.NewConsentFileRepo(database.Pool)
	documentsRepo := repos.NewDocumentsRepo(database.Pool)

	// storage
	var st ports.Storage
	if cfg.Storage.Driver == "s3" {
		st = storage.NewS3(storage.S3Config{
			Endpoint:     cfg.Storage.S3Endpoint,
			Region:       cfg.Storage.S3Region,
			Bucket:       cfg.Storage.S3Bucket,
			AccessKey:    cfg.Storage.S3Key,
			SecretKey:    cfg.Storage.S3Secret,
			UsePathStyle: true,
		})
	} else {
		publicURL := cfg.Storage.PublicURL
		if publicURL == "" {
			publicURL = cfg.AppURL
		}
		st = storage.NewLocal(cfg.Storage.LocalDir, publicURL)
	}

	// email templates + mailer
	templateRoot := "./templates/email"
	tpl := mail.NewTemplates(templateRoot)
	tplSvc := mail.NewTemplatesService(tpl)

	mailerSvc := mail.NewSMTPMailer(cfg.SMTP.Host, cfg.SMTP.Port, cfg.SMTP.From, cfg.SMTP.User, cfg.SMTP.Pass)

	// services
	appCfg := services.AppConfig{
		AppURL:         cfg.AppURL,
		AccessTTL:      cfg.JWT.AccessTTL,
		RefreshTTL:     cfg.JWT.RefreshTTL,
		VerifyEmailTTL: 24 * 60 * 60 * 1e9, // 24h default; лучше вынести в env позже
		CookieSecure:   cfg.Env == "prod",
		CookieDomain:   "",

		OrganizerEmails: []string{}, // можно добавить из env позже
	}
	clock := services.SystemClock{}

	authSvc := services.NewAuthService(appCfg, cfg.JWT.Secret, usersRepo, sessionsRepo, emailTokensRepo, profilesRepo, mailerSvc, tplSvc, clock)
	regSvc := services.NewRegistrationService(appCfg, usersRepo, profilesRepo, mailerSvc, tplSvc)
	talkSvc := services.NewTalkService(appCfg, talksRepo, profilesRepo, sectionsRepo, usersRepo, mailerSvc, tplSvc)
	pageSvc := services.NewPageService(pagesRepo)
	newsSvc := services.NewNewsService(newsRepo)
	expSvc := services.NewExportService(exportsRepo)
	adminSvc := services.NewAdminService(appCfg, usersRepo, profilesRepo, talksRepo, sectionsRepo, newsRepo, pagesRepo, auditRepo, mailerSvc, tplSvc)

	api := r.Group("/api")

	// auth
	api.POST("/auth/register", authRL.Middleware(), h.Register(authSvc))
	api.POST("/auth/login", authRL.Middleware(), h.Login(authSvc, appCfg))
	api.POST("/auth/refresh", h.Refresh(authSvc, appCfg))
	api.POST("/auth/logout", h.Logout(authSvc, appCfg))
	api.GET("/auth/verify-email", h.VerifyEmail(authSvc))

	// public
	pub := api.Group("/public")
	pub.GET("/pages/:slug", h.PublicPage(pageSvc))
	pub.GET("/news", h.PublicNewsList(newsSvc))
	pub.GET("/news/:id", h.PublicNewsGet(newsSvc))
	pub.GET("/participants", h.PublicParticipants(profilesRepo))
	pub.GET("/sections", h.PublicSections(sectionsRepo))
	pub.GET("/program", h.PublicProgram(talksRepo))
	pub.GET("/program-file", h.PublicProgramFile(database.Pool))
	pub.GET("/materials", h.PublicMaterialsList(materialsRepo))

	// me
	api.GET("/me", middleware.Auth(middleware.AuthConfig{JWTSecret: cfg.JWT.Secret}), h.Me(usersRepo))

	// files (participant)
	api.POST("/files/consent",
		regRL.Middleware(),
		middleware.Auth(middleware.AuthConfig{JWTSecret: cfg.JWT.Secret}),
		h.UploadConsent(st, consentRepo),
	)

	participant := api.Group("/participant",
		middleware.Auth(middleware.AuthConfig{JWTSecret: cfg.JWT.Secret}),
	)
	participant.GET("/profile", h.GetProfile(profilesRepo))
	participant.PUT("/profile", h.PutProfile(profilesRepo))
	participant.GET("/talks", h.ListMyTalks(talkSvc))
	participant.POST("/talks", h.CreateTalk(talkSvc))
	participant.GET("/talks/:id", h.GetMyTalk(talkSvc))
	participant.PUT("/talks/:id", h.UpdateTalk(talkSvc))
	participant.DELETE("/talks/:id", h.DeleteTalk(talkSvc))
	participant.POST("/talks/:id/file", h.UploadTalkFile(st, talkSvc))

	// registration submit
	api.POST("/registration/submit",
		regRL.Middleware(),
		middleware.Auth(middleware.AuthConfig{JWTSecret: cfg.JWT.Secret}),
		h.SubmitRegistration(regSvc),
	)

	// admin
	admin := api.Group("/admin",
		middleware.Auth(middleware.AuthConfig{JWTSecret: cfg.JWT.Secret}),
		middleware.RequireRole("ADMIN"),
	)

	admin.GET("/users", h.AdminListUsers(adminSvc))
	admin.PATCH("/users/:id/status", h.AdminSetUserStatus(adminSvc))
	admin.POST("/users/reset-password", h.ResetUserPasswordHandler(usersRepo))
	admin.GET("/users/:id/consents", h.AdminGetUserConsents(consentRepo))

	admin.GET("/sections", h.AdminSectionsList(sectionsRepo))
	admin.POST("/sections", h.AdminSectionsCreate(sectionsRepo))

	admin.GET("/news", h.AdminNewsList(newsSvc))
	admin.POST("/news", h.AdminNewsCreate(newsSvc))
	admin.PUT("/news/:id", h.AdminNewsUpdate(newsSvc))
	admin.DELETE("/news/:id", h.AdminNewsDelete(newsSvc))

	admin.GET("/pages", h.AdminPagesList(pageSvc))
	admin.PUT("/pages/:slug", h.AdminPagesUpsert(pageSvc))

	admin.GET("/talks", h.AdminTalksList(talksRepo))
	admin.PUT("/talks/:id", h.AdminUpdateTalk(talksRepo))

	admin.POST("/program/file", h.AdminUploadProgramFile(st, database.Pool))
	admin.DELETE("/program/file", h.AdminDeleteProgramFile(database.Pool))

	admin.GET("/materials", h.AdminListMaterials(materialsRepo))
	admin.POST("/materials", h.AdminUploadMaterial(st, materialsRepo))
	admin.PUT("/materials/:id", h.AdminUpdateMaterial(materialsRepo))
	admin.DELETE("/materials/:id", h.AdminDeleteMaterial(st, materialsRepo))

	admin.GET("/audit", h.AdminAuditList(auditRepo))

	admin.POST("/documents/template", h.AdminUploadDocumentTemplate(st, documentsRepo))
	admin.GET("/documents/templates", h.AdminListDocumentTemplates(documentsRepo))

	// exports
	admin.GET("/exports/participants.csv", h.ExportParticipantsCSV(expSvc))
	admin.GET("/exports/participants.xlsx", h.ExportParticipantsXLSX(expSvc))
	admin.GET("/exports/talks_by_section.xlsx", h.ExportTalksBySectionXLSX(expSvc))

	// public document templates
	pub.GET("/documents/templates", h.PublicListDocumentTemplates(documentsRepo))

	// participant signed documents
	participant.POST("/documents/signed", h.UploadSignedDocument(st, documentsRepo))

	// static files - serve uploaded files (consents, talks, etc)
	localDir := cfg.Storage.LocalDir
	if localDir != "" {
		r.Static("/files", localDir)
	}

	return r
}
