package services

import (
	"context"

	"confsite/backend/internal/domain"
	"confsite/backend/internal/ports"
)

type PageService struct {
	pages ports.PageRepo
}

func NewPageService(p ports.PageRepo) *PageService { return &PageService{pages: p} }

func (s *PageService) Get(ctx context.Context, slug string) (*domain.PageContent, error) {
	return s.pages.GetBySlug(ctx, slug)
}

func (s *PageService) Upsert(ctx context.Context, p domain.PageContent) error {
	return s.pages.Upsert(ctx, p)
}

func (s *PageService) List(ctx context.Context) ([]domain.PageContent, error) {
	return s.pages.List(ctx)
}
