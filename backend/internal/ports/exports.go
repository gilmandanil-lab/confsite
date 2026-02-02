package ports

import (
	"context"
)

type ParticipantExportRow struct {
	FullName    string
	Affiliation string
	City        string
	Email       string
}

type TalkExportRow struct {
	Section     string
	Title       string
	Kind        string
	AuthorsJSON []byte
	Speaker     string
	SpeakerCity string
	SpeakerAff  string
	Abstract    string
}

type ExportRepo interface {
	Participants(ctx context.Context) ([]ParticipantExportRow, error)
	Talks(ctx context.Context) ([]TalkExportRow, error)
}
