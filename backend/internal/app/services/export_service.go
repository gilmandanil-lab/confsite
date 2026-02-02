package services

import (
	"context"
	"encoding/json"
	"strings"

	"confsite/backend/internal/lib/files"
	"confsite/backend/internal/ports"
)

type ExportService struct {
	repo ports.ExportRepo
}

func NewExportService(r ports.ExportRepo) *ExportService { return &ExportService{repo: r} }

func (s *ExportService) ParticipantsCSV(ctx context.Context, includeEmail bool) ([]byte, error) {
	rows, err := s.repo.Participants(ctx)
	if err != nil {
		return nil, err
	}
	header := []string{"FullName", "Affiliation", "City"}
	if includeEmail {
		header = append(header, "Email")
	}
	out := make([][]string, 0, len(rows))
	for _, r := range rows {
		row := []string{r.FullName, r.Affiliation, r.City}
		if includeEmail {
			row = append(row, r.Email)
		}
		out = append(out, row)
	}
	return files.BuildCSV(header, out)
}

func (s *ExportService) ParticipantsXLSX(ctx context.Context, includeEmail bool) ([]byte, error) {
	rows, err := s.repo.Participants(ctx)
	if err != nil {
		return nil, err
	}
	header := []string{"FullName", "Affiliation", "City"}
	if includeEmail {
		header = append(header, "Email")
	}
	f, sheet := files.NewXLSX("Participants", header)

	rn := 2
	for _, r := range rows {
		vals := []any{r.FullName, r.Affiliation, r.City}
		if includeEmail {
			vals = append(vals, r.Email)
		}
		files.XLSXSetRow(f, sheet, rn, vals)
		rn++
	}
	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func (s *ExportService) TalksBySectionXLSX(ctx context.Context) ([]byte, error) {
	rows, err := s.repo.Talks(ctx)
	if err != nil {
		return nil, err
	}
	header := []string{"Section", "Title", "Kind", "Authors", "Speaker", "SpeakerAffiliation", "SpeakerCity", "Abstract"}
	f, sheet := files.NewXLSX("Talks", header)

	rn := 2
	for _, r := range rows {
		authors := authorsJSONToLine(r.AuthorsJSON)
		files.XLSXSetRow(f, sheet, rn, []any{
			r.Section, r.Title, r.Kind, authors, r.Speaker, r.SpeakerAff, r.SpeakerCity, r.Abstract,
		})
		rn++
	}
	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func authorsJSONToLine(b []byte) string {
	if len(b) == 0 {
		return ""
	}
	var authors []struct {
		FullName    string `json:"fullName"`
		Affiliation string `json:"affiliation"`
	}
	if err := json.Unmarshal(b, &authors); err != nil {
		return ""
	}
	parts := make([]string, 0, len(authors))
	for _, a := range authors {
		parts = append(parts, strings.TrimSpace(a.FullName)+" ("+strings.TrimSpace(a.Affiliation)+")")
	}
	return strings.Join(parts, "; ")
}
