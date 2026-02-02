package services

import (
	"context"

	"confsite/backend/internal/domain"
	"confsite/backend/internal/ports"

	"github.com/google/uuid"
)

type NewsService struct {
	news ports.NewsRepo
}

func NewNewsService(n ports.NewsRepo) *NewsService { return &NewsService{news: n} }

func (s *NewsService) List(ctx context.Context) ([]domain.News, error) {
	return s.news.List(ctx)
}

func (s *NewsService) Get(ctx context.Context, id uuid.UUID) (*domain.News, error) {
	return s.news.Get(ctx, id)
}

func (s *NewsService) Create(ctx context.Context, n domain.News) (uuid.UUID, error) {
	return s.news.Create(ctx, n)
}

func (s *NewsService) Update(ctx context.Context, n domain.News) error {
	return s.news.Update(ctx, n)
}

func (s *NewsService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.news.Delete(ctx, id)
}
