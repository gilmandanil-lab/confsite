package main

import (
	"log"

	"confsite/backend/internal/adapters/db"
	"confsite/backend/internal/adapters/http"
	"confsite/backend/internal/config"
)

func main() {
	cfg := config.Load()

	database := db.New(cfg.DB.DSN)
	defer database.Close()

	router := http.NewRouter(cfg, database)

	log.Println("API started on :8084")
	if err := router.Run(":8084"); err != nil {
		log.Fatal(err)
	}
}
