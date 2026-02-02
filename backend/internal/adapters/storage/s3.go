package storage

import (
	"context"
	"io"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3 struct {
	Client        *s3.Client
	Bucket        string
	PublicBaseURL string // если используешь CDN/публичный бакет
}

func (s S3) Put(ctx context.Context, key string, r io.Reader, size int64, mime string) error {
	_, err := s.Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      &s.Bucket,
		Key:         &key,
		Body:        r,
		ContentType: &mime,
	})
	return err
}

func (s S3) Delete(ctx context.Context, key string) error {
	_, err := s.Client.DeleteObject(ctx, &s3.DeleteObjectInput{Bucket: &s.Bucket, Key: &key})
	return err
}

func (s S3) PublicURL(key string) string {
	if s.PublicBaseURL != "" {
		return s.PublicBaseURL + "/" + key
	}
	// в реальном проде лучше отдавать signed URL через отдельный метод
	return key
}
