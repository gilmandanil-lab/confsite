package ports

import (
	"context"
	"io"
)

type StoredFile struct {
	Key       string
	URL       string // публичный/подписанный URL (в dev может быть через /files)
	Filename  string
	Mime      string
	SizeBytes int64
}

type Storage interface {
	Put(ctx context.Context, key string, r io.Reader, size int64, mime string) error
	Delete(ctx context.Context, key string) error
	PublicURL(key string) string
}
