package files

import (
	"bytes"
	"errors"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
)

var (
	ErrBadFileType = errors.New("unsupported file type")
)

type FileCheck struct {
	MaxBytes int64
	Allowed  map[string]bool // allowed mime
}

func SniffAndValidate(filename string, data []byte, cfg FileCheck) (string, error) {
	if cfg.MaxBytes > 0 && int64(len(data)) > cfg.MaxBytes {
		return "", errors.New("file too large")
	}

	// sniff by content
	sniff := http.DetectContentType(data)
	// also allow by extension mime
	ext := strings.ToLower(filepath.Ext(filename))
	extMime := mime.TypeByExtension(ext)

	ok := cfg.Allowed[sniff] || (extMime != "" && cfg.Allowed[extMime])

	// Normalize common office mimes that browsers may send
	if !ok {
		if ext == ".doc" && cfg.Allowed["application/msword"] {
			ok = true
			sniff = "application/msword"
		}
		if ext == ".docx" && cfg.Allowed["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] {
			ok = true
			sniff = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		}
	}

	if !ok {
		return "", ErrBadFileType
	}

	// protect against empty sniff like text/plain when file is binary:
	if sniff == "text/plain; charset=utf-8" && (ext == ".pdf" || ext == ".doc" || ext == ".docx") {
		// try a second sniff on first bytes
		head := data
		if len(head) > 512 {
			head = head[:512]
		}
		sniff2 := http.DetectContentType(bytes.TrimSpace(head))
		if cfg.Allowed[sniff2] {
			return sniff2, nil
		}
	}

	return sniff, nil
}
