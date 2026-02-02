package repos

import (
	"context"
	"fmt"

	"confsite/backend/internal/adapters/db/sqlc"
	"confsite/backend/internal/ports"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ExportsRepo struct {
	q *sqlc.Queries
}

func NewExportsRepo(db *pgxpool.Pool) *ExportsRepo {
	return &ExportsRepo{q: sqlc.New(db)}
}

func (r *ExportsRepo) Participants(ctx context.Context) ([]ports.ParticipantExportRow, error) {
	rows, err := r.q.ExportParticipants(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]ports.ParticipantExportRow, 0, len(rows))
	for _, x := range rows {
		out = append(out, ports.ParticipantExportRow{
			FullName:    fmt.Sprint(x.FullName),
			Affiliation: x.Affiliation,
			City:        x.City,
			Email:       x.Email,
		})
	}
	return out, nil
}

func (r *ExportsRepo) Talks(ctx context.Context) ([]ports.TalkExportRow, error) {
	rows, err := r.q.ExportTalks(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]ports.TalkExportRow, 0, len(rows))
	for _, x := range rows {
		section := x.Section.String
		if !x.Section.Valid {
			section = ""
		}
		out = append(out, ports.TalkExportRow{
			Section:     section,
			Title:       x.Title,
			Kind:        x.Kind,
			AuthorsJSON: x.Authors,
			Speaker:     fmt.Sprint(x.Speaker),
			Abstract:    x.Abstract,
		})
	}
	return out, nil
}
