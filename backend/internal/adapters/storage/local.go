package storage

import (
	"context"
	"io"
	"os"
	"path/filepath"
)

type Local struct {
	BaseDir       string
	PublicBaseURL string
}

func (l Local) Put(ctx context.Context, key string, r io.Reader, size int64, mime string) error {
	_ = os.MkdirAll(filepath.Dir(filepath.Join(l.BaseDir, key)), 0o755)
	f, err := os.Create(filepath.Join(l.BaseDir, key))
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = io.Copy(f, r)
	return err
}

func (l Local) Delete(ctx context.Context, key string) error {
	return os.Remove(filepath.Join(l.BaseDir, key))
}

func (l Local) PublicURL(key string) string {
	return l.PublicBaseURL + "/" + key
}
