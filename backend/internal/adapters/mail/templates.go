package mail

import (
	"bytes"
	"html/template"
	"os"
	"path/filepath"
	"strings"
	texttmpl "text/template"
)

type Templates struct {
	root string // e.g. /app/templates/email
}

func NewTemplates(root string) *Templates {
	return &Templates{root: root}
}

func (t *Templates) renderHTML(lang, name string, data any) (string, error) {
	p := filepath.Join(t.root, lang, name+".html")
	b, err := os.ReadFile(p)
	if err != nil {
		return "", err
	}
	tpl, err := template.New(name).Parse(string(b))
	if err != nil {
		return "", err
	}
	var out bytes.Buffer
	if err := tpl.Execute(&out, data); err != nil {
		return "", err
	}
	return out.String(), nil
}

func (t *Templates) renderText(lang, name string, data any) (string, error) {
	p := filepath.Join(t.root, lang, name+".txt")
	b, err := os.ReadFile(p)
	if err != nil {
		return "", err
	}
	tpl, err := texttmpl.New(name).Parse(string(b))
	if err != nil {
		return "", err
	}
	var out bytes.Buffer
	if err := tpl.Execute(&out, data); err != nil {
		return "", err
	}
	return out.String(), nil
}

func safeLang(lang string) string {
	lang = strings.ToLower(lang)
	if lang == "en" {
		return "en"
	}
	return "ru"
}
